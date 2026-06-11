# Spécification Backend — Notifications Push

## Architecture globale

```
Article publié (Laravel)
    └── Observer/Event → NotificationService → Expo Push API → Téléphones
                                                               ↓
                                              App reçoit la notif → stocke localement
                                              Badge +1 sur la cloche
                                              Tap → ouvre l'article
```

---

## 1. Table `push_tokens`

```sql
CREATE TABLE push_tokens (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id       BIGINT UNSIGNED NULL,          -- NULL = utilisateur non connecté
    token         VARCHAR(255) NOT NULL UNIQUE,
    platform      ENUM('ios','android') NOT NULL,
    device        VARCHAR(255) NULL,
    topics        JSON NULL,                     -- ex: ["breaking","actualites"]
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);
```

---

## 2. Endpoint — Enregistrement du token

### `POST /api/push-token`

**Headers** : `Authorization: Bearer {token}` (optionnel — lie le token au compte)

**Body** :
```json
{
  "token":    "ExponentPushToken[xxxxxx]",
  "platform": "android",
  "device":   "Samsung Galaxy S23"
}
```

**Réponse 200** :
```json
{ "message": "Token enregistré" }
```

**Logique** :
```php
// PushTokenController@store
public function store(Request $request)
{
    $request->validate([
        'token'    => 'required|string',
        'platform' => 'required|in:ios,android',
        'device'   => 'nullable|string',
    ]);

    PushToken::updateOrCreate(
        ['token' => $request->token],
        [
            'user_id'  => $request->user()?->id,  // null si non connecté
            'platform' => $request->platform,
            'device'   => $request->device,
        ]
    );

    return response()->json(['message' => 'Token enregistré']);
}
```

---

## 3. Service d'envoi — `ExpoPushService`

```php
class ExpoPushService
{
    const EXPO_URL = 'https://exp.host/--/api/v2/push/send';

    /**
     * Envoie des notifications push à une liste de tokens Expo.
     *
     * @param array $tokens   ['ExponentPushToken[xxx]', ...]
     * @param string $title   Titre de la notification
     * @param string $body    Corps du message
     * @param array  $data    Données supplémentaires (type, article_id, etc.)
     */
    public function send(array $tokens, string $title, string $body, array $data = []): void
    {
        if (empty($tokens)) return;

        // Expo accepte max 100 tokens par requête
        foreach (array_chunk($tokens, 100) as $chunk) {
            $messages = array_map(fn($token) => [
                'to'    => $token,
                'title' => $title,
                'body'  => $body,
                'data'  => $data,
                'sound' => 'default',
                'badge' => 1,
            ], $chunk);

            Http::post(self::EXPO_URL, $messages);
        }
    }
}
```

---

## 4. Notification à la publication d'un article

### Observer sur le modèle `Article`

```php
class ArticleObserver
{
    public function created(Article $article): void
    {
        // Ne pas notifier les brouillons
        if (!$article->is_published) return;
        dispatch(new SendArticleNotificationJob($article));
    }

    public function updated(Article $article): void
    {
        // Article passe de brouillon à publié
        if ($article->isDirty('is_published') && $article->is_published) {
            dispatch(new SendArticleNotificationJob($article));
        }
    }
}
```

### Job `SendArticleNotificationJob`

```php
class SendArticleNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Article $article) {}

    public function handle(ExpoPushService $push): void
    {
        $tokens = PushToken::pluck('token')->toArray();

        $push->send(
            tokens: $tokens,
            title:  $this->article->title,
            body:   Str::limit(strip_tags($this->article->excerpt ?? ''), 120),
            data: [
                'type'       => 'article',
                'article_id' => (string) $this->article->id,
                'category'   => $this->article->category?->name ?? 'Actualités',
            ]
        );
    }
}
```

---

## 5. Notification d'abonnement expirant (Cron)

### Commande `SendSubscriptionExpiryNotifications`

```php
class SendSubscriptionExpiryNotifications extends Command
{
    protected $signature   = 'notifications:subscription-expiry';
    protected $description = 'Notifie les abonnés dont l\'abonnement expire dans 7, 3 ou 1 jour(s)';

    public function handle(ExpoPushService $push): void
    {
        foreach ([7, 3, 1] as $days) {
            $date = now()->addDays($days)->toDateString();

            $subscriptions = Subscription::whereDate('expires_at', $date)
                ->where('is_active', true)
                ->with('user.pushTokens')
                ->get();

            foreach ($subscriptions as $sub) {
                $tokens = $sub->user->pushTokens->pluck('token')->toArray();
                if (empty($tokens)) continue;

                $push->send(
                    tokens: $tokens,
                    title:  'Abonnement expirant bientôt',
                    body:   "Votre abonnement expire dans {$days} jour" . ($days > 1 ? 's' : '') . '. Renouvelez dès maintenant.',
                    data: [
                        'type' => 'subscription',
                    ]
                );
            }
        }
    }
}
```

### Planification dans `app/Console/Kernel.php`

```php
protected function schedule(Schedule $schedule): void
{
    // Tous les matins à 9h
    $schedule->command('notifications:subscription-expiry')->dailyAt('09:00');
}
```

---

## 6. Notification à la publication d'un numéro de magazine

### Observer sur le modèle `MagazineIssue`

```php
class MagazineIssueObserver
{
    public function created(MagazineIssue $issue): void
    {
        if (!$issue->is_published) return;
        dispatch(new SendMagazineNotificationJob($issue));
    }

    public function updated(MagazineIssue $issue): void
    {
        if ($issue->isDirty('is_published') && $issue->is_published) {
            dispatch(new SendMagazineNotificationJob($issue));
        }
    }
}
```

### Job `SendMagazineNotificationJob`

```php
class SendMagazineNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public MagazineIssue $issue) {}

    public function handle(ExpoPushService $push): void
    {
        // Notifie uniquement les abonnés actifs
        $tokens = PushToken::whereHas('user', function ($q) {
            $q->whereHas('subscription', fn($s) => $s->where('is_active', true));
        })->pluck('token')->toArray();

        // + les tokens non authentifiés (utilisateurs sans compte)
        $guestTokens = PushToken::whereNull('user_id')->pluck('token')->toArray();

        $allTokens = array_unique(array_merge($tokens, $guestTokens));

        $push->send(
            tokens: $allTokens,
            title:  "Nouveau numéro disponible — N°{$this->issue->number}",
            body:   $this->issue->title ?? "Le dernier numéro de Santé Afrique est en ligne. Découvrez-le dès maintenant.",
            data: [
                'type' => 'magazine',
            ]
        );
    }
}
```

### Enregistrement dans `AppServiceProvider`

```php
public function boot(): void
{
    Article::observe(ArticleObserver::class);
    MagazineIssue::observe(MagazineIssueObserver::class); // ← ajouter
}
```

---

## 7. Format de la notification push (payload Expo)

L'app lit les champs `data` pour router la notification :

| `data.type`    | Comportement app              | Champs data requis                    | Icône app       |
|----------------|-------------------------------|---------------------------------------|-----------------|
| `article`      | Ouvre l'article               | `article_id`, `category` (optionnel)  | 🔵 file-text    |
| `magazine`     | Ouvre l'écran Magazine        | *(aucun)*                             | 🟣 book-open    |
| `subscription` | Notification dans la cloche   | *(aucun)*                             | 🟠 star         |
| `update`       | Notification dans la cloche   | *(aucun)*                             | 🟢 download     |
| `info`         | Notification dans la cloche   | *(aucun)*                             | ⚫ bell         |

---

## 8. Checklist d'implémentation

- [ ] Migration `push_tokens` table
- [ ] `PushToken` model + relation `User hasMany PushToken`
- [ ] `POST /api/push-token` endpoint (avec ou sans auth)
- [ ] `ExpoPushService` (injection de dépendance)
- [ ] `ArticleObserver` enregistré dans `AppServiceProvider`
- [ ] `SendArticleNotificationJob` (queue)
- [ ] `MagazineIssueObserver` enregistré dans `AppServiceProvider`
- [ ] `SendMagazineNotificationJob` (queue)
- [ ] Commande `notifications:subscription-expiry`
- [ ] Cron planifié à 9h quotidien
- [ ] Tester avec Expo Push Tool : https://expo.dev/notifications
