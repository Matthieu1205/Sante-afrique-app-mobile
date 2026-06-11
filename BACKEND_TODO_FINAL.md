# BACKEND — Document de travail complet
## Santé Afrique App Mobile ↔ Laravel API

> **Base URL :** `https://api.santeafrique.net/api`
> **Auth :** Bearer Token (Sanctum ou Passport)
> **Ce document couvre :** tous les endpoints manquants, incomplets ou à corriger, identifiés après audit complet de l'app mobile.

---

## Fichiers Laravel concernés (vue d'ensemble)

| Fichier | Rôle |
|---------|------|
| `routes/api.php` | Déclarer toutes les routes — **à modifier pour chaque point** |
| `app/Http/Controllers/AuthController.php` | Login, register, refresh token, change password |
| `app/Http/Controllers/UserController.php` | Profil, préférences, historique, push token |
| `app/Http/Controllers/MagazineController.php` | Numéros, sommaire, **URL sécurisée de lecture** |
| `app/Http/Controllers/JobController.php` | Offres, candidatures, postuler |
| `app/Http/Controllers/CVController.php` | Dépôt CV, consultation, export CSV |
| `app/Http/Controllers/SubscriptionController.php` | Plans, créer abonnement, endpoint stable |
| `app/Http/Controllers/NewsletterController.php` | Préférences newsletters, toggle |
| `app/Http/Controllers/NotificationController.php` | Token push, préférences notifications |
| `app/Http/Controllers/SearchController.php` | Suggestions, tendances |
| `app/Http/Controllers/PartnerController.php` | Partenaires, kit média |
| `app/Http/Middleware/CheckSubscription.php` | Middleware paywall (articles premium, CVthèque, magazine) |

---

---

# 🔴 CRITIQUE — À implémenter en priorité absolue

---

## 1. Sécurité des articles premium

**Problème :** Actuellement l'API retourne le contenu complet des articles premium même aux utilisateurs non-abonnés. Le blocage est uniquement côté app (peut être contourné en inspectant la réponse JSON).

**Fichier :** `app/Http/Controllers/ArticleController.php`
**Middleware :** `app/Http/Middleware/CheckSubscription.php`

### Route à modifier dans `routes/api.php`
```php
Route::get('/articles/{id}', [ArticleController::class, 'show']);
```

### Logique dans `ArticleController@show`
```php
public function show(Request $request, $id)
{
    $article = Article::findOrFail($id);

    if ($article->is_premium) {
        $user = $request->user(); // null si non connecté
        $isSubscribed = $user && $user->hasActiveSubscription();

        if (!$isSubscribed) {
            // Retourne seulement les 2 premiers paragraphes
            $preview = $this->extractPreview($article->body, 2);
            return response()->json([
                'id'          => $article->id,
                'title'       => $article->title,
                'body'        => $preview,
                'is_premium'  => true,
                'is_locked'   => true,   // ← flag clair pour l'app
                'author'      => $article->author,
                'published_at'=> $article->published_at,
                // ... autres champs non-sensibles
            ]);
        }
    }

    // Abonné ou article gratuit → contenu complet
    return response()->json($article->toFullArray());
}

private function extractPreview(string $html, int $paragraphs): string
{
    preg_match_all('/<p[^>]*>.*?<\/p>/is', $html, $matches);
    return implode('', array_slice($matches[0], 0, $paragraphs));
}
```

### Réponse attendue par l'app
```json
{
  "id": 42,
  "title": "...",
  "body": "<p>Premier paragraphe...</p><p>Deuxième...</p>",
  "is_premium": true,
  "is_locked": true,
  "author": "Dr. X",
  "published_at": "2026-06-01T10:00:00Z"
}
```

---

## 2. Enregistrement du token push (notifications)

**Problème :** L'app envoie le token Expo push au démarrage mais l'endpoint `POST /push-token` n'existe pas → aucune notification serveur possible.

**Fichier :** `app/Http/Controllers/NotificationController.php`

### Route dans `routes/api.php`
```php
// Route publique (token envoyé même avant login)
Route::post('/push-token', [NotificationController::class, 'store']);
```

### Controller
```php
public function store(Request $request)
{
    $request->validate([
        'token'    => 'required|string',
        'platform' => 'nullable|in:ios,android',
        'device'   => 'nullable|string',
    ]);

    $data = [
        'token'      => $request->token,
        'platform'   => $request->platform,
        'device'     => $request->device,
        'user_id'    => $request->user()?->id, // null si non connecté
        'updated_at' => now(),
    ];

    // Upsert : un token = une ligne
    PushToken::updateOrCreate(['token' => $request->token], $data);

    return response()->json(['ok' => true]);
}
```

### Format envoyé par l'app
```json
{
  "token": "ExponentPushToken[xxxxxx]",
  "platform": "android",
  "device": "Samsung Galaxy S23"
}
```

---

## 3. Refresh du token JWT

**Problème :** Quand le token expire, l'app échoue silencieusement sur tous les appels authentifiés sans déconnecter l'utilisateur.

**Fichier :** `app/Http/Controllers/AuthController.php`

### Route dans `routes/api.php`
```php
Route::middleware('auth:sanctum')->post('/refresh-token', [AuthController::class, 'refresh']);
```

### Controller (Sanctum)
```php
public function refresh(Request $request)
{
    $user = $request->user();

    // Révoque l'ancien token
    $request->user()->currentAccessToken()->delete();

    // Crée un nouveau token
    $newToken = $user->createToken('mobile-app')->plainTextToken;

    return response()->json([
        'token' => $newToken,
        'user'  => [
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
        ],
    ]);
}
```

### Réponse attendue par l'app
```json
{
  "token": "nouveau_token_ici",
  "user": { "id": 1, "name": "Jude K", "email": "..." }
}
```

---

## 4. Changement de mot de passe

**Problème :** Aucun écran ni endpoint pour changer le mot de passe depuis l'app (uniquement "mot de passe oublié" par email).

**Fichier :** `app/Http/Controllers/AuthController.php`

### Route dans `routes/api.php`
```php
Route::middleware('auth:sanctum')->post('/user/change-password', [AuthController::class, 'changePassword']);
```

### Controller
```php
public function changePassword(Request $request)
{
    $request->validate([
        'current_password' => 'required|string',
        'new_password'     => 'required|string|min:8|confirmed',
    ]);

    if (!Hash::check($request->current_password, $request->user()->password)) {
        return response()->json([
            'ok'      => false,
            'message' => 'Mot de passe actuel incorrect.',
        ], 422);
    }

    $request->user()->update([
        'password' => Hash::make($request->new_password),
    ]);

    return response()->json(['ok' => true, 'message' => 'Mot de passe mis à jour.']);
}
```

### Format envoyé par l'app
```json
{
  "current_password": "ancienMotDePasse",
  "new_password": "nouveauMotDePasse",
  "new_password_confirmation": "nouveauMotDePasse"
}
```

---

---

# 🟡 IMPORTANT — À implémenter pour les fonctionnalités principales

---

## 5. Magazine — Contenu réel (lecture)

**Problème :** L'app affiche la liste des magazines et le sommaire correctement, mais ne peut pas afficher le contenu réel du magazine. L'endpoint `GET /magazine/issues/{id}/reader-url` doit retourner une URL valide vers le contenu (PDF ou lecteur flipbook) en vérifiant l'abonnement.

**Fichier :** `app/Http/Controllers/MagazineController.php`

### Route dans `routes/api.php`
```php
Route::middleware('auth:sanctum')->get('/magazine/issues/{id}/reader-url', [MagazineController::class, 'readerUrl']);
```

### Controller
```php
public function readerUrl(Request $request, $id)
{
    $issue = MagazineIssue::findOrFail($id);
    $user  = $request->user();

    // Vérification abonnement (sauf si numéro gratuit)
    if (!$issue->is_free && !$user->hasActiveSubscription()) {
        return response()->json([
            'ok'      => false,
            'locked'  => true,
            'message' => 'Abonnement requis pour lire ce numéro.',
        ], 403);
    }

    // Option A : Le magazine est un PDF stocké sur le serveur
    // Générer une URL signée temporaire (expire dans 2h)
    $url = Storage::temporaryUrl(
        "magazines/{$issue->pdf_file}",
        now()->addHours(2)
    );

    // Option B : Le magazine est sur un service externe (Issuu, Calameo, FlipHTML5)
    // Retourner directement l'URL du lecteur
    // $url = $issue->reader_url; // URL déjà stockée en base

    return response()->json([
        'ok'  => true,
        'url' => $url,
        'type'=> 'pdf', // ou 'flipbook', 'webview'
    ]);
}
```

### Réponse attendue par l'app
```json
{
  "ok": true,
  "url": "https://storage.santeafrique.net/magazines/numero-42.pdf?signature=xxx&expires=xxx",
  "type": "pdf"
}
```

### En cas de non-abonné
```json
{
  "ok": false,
  "locked": true,
  "message": "Abonnement requis pour lire ce numéro."
}
```

### ⚠️ Points importants pour le magazine
- Si le PDF est sur AWS S3 ou espace de stockage Laravel : utiliser `Storage::temporaryUrl()` avec expiration
- Si le PDF est sur un service externe (Issuu etc.) : stocker l'URL dans la colonne `reader_url` du modèle `MagazineIssue`
- Le champ `is_free` dans la table `magazine_issues` doit exister pour les numéros gratuits
- L'app ouvre l'URL dans un WebView → l'URL doit être directement lisible (pas de redirect login)

### Modèle `MagazineIssue` — colonnes requises
```
id, title, number, cover_url, pdf_file (ou reader_url),
published_at, is_free, sommaire (JSON), price
```

---

## 6. Mise à jour du profil utilisateur

**Fichier :** `app/Http/Controllers/UserController.php`

### Route dans `routes/api.php`
```php
Route::middleware('auth:sanctum')->patch('/user/profile', [UserController::class, 'update']);
```

### Controller
```php
public function update(Request $request)
{
    $request->validate([
        'name'    => 'nullable|string|max:255',
        'phone'   => 'nullable|string|max:20',
        'country' => 'nullable|string|max:100',
    ]);

    $request->user()->update($request->only(['name', 'phone', 'country']));

    return response()->json(['ok' => true, 'message' => 'Profil mis à jour.']);
}
```

### Colonnes requises dans la table `users`
```
name, email, phone (nullable), country (nullable), password
```

---

## 7. Candidatures — Lister et postuler

**Fichier :** `app/Http/Controllers/JobController.php`

### Routes dans `routes/api.php`
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/applications', [JobController::class, 'myApplications']);
    Route::post('/jobs/{id}/apply', [JobController::class, 'apply']);
});
```

### Controller — `myApplications`
```php
public function myApplications(Request $request)
{
    $applications = Application::where('user_id', $request->user()->id)
        ->with('job:id,title,company')
        ->latest()
        ->get()
        ->map(fn($app) => [
            'id'         => $app->id,
            'job_id'     => $app->job_id,
            'job_title'  => $app->job->title ?? 'Poste non précisé',
            'company'    => $app->job->company ?? '—',
            'status'     => $app->status,
            'created_at' => $app->created_at,
        ]);

    return response()->json(['data' => $applications]);
}
```

### Controller — `apply`
```php
public function apply(Request $request, $id)
{
    $job = Job::findOrFail($id);

    // Vérifie si déjà postulé
    $existing = Application::where('user_id', $request->user()->id)
        ->where('job_id', $id)->first();

    if ($existing) {
        return response()->json(['ok' => false, 'message' => 'Vous avez déjà postulé à cette offre.'], 422);
    }

    Application::create([
        'user_id' => $request->user()->id,
        'job_id'  => $id,
        'status'  => 'pending',
    ]);

    return response()->json(['ok' => true, 'message' => 'Candidature envoyée.']);
}
```

### Table `applications` requise
```
id, user_id (FK), job_id (FK),
status (enum: pending/accepted/rejected/interview/viewed/shortlisted),
created_at
```

---

## 8. Abonnement — Endpoint stable + création

**Fichier :** `app/Http/Controllers/SubscriptionController.php`

### ⚠️ Problème actuel
L'app cherche l'abonnement actif sur 5 endpoints différents. **Normaliser sur un seul.**

### Route unique à définir dans `routes/api.php`
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/subscription', [SubscriptionController::class, 'active']);
    Route::post('/subscriptions/create', [SubscriptionController::class, 'create']);
});
```

### Controller — `active`
```php
public function active(Request $request)
{
    $subscription = $request->user()->activeSubscription();

    if (!$subscription) {
        return response()->json(['data' => null]);
    }

    return response()->json([
        'data' => [
            'plan'       => $subscription->plan->name,
            'starts_at'  => $subscription->starts_at,
            'expires_at' => $subscription->expires_at,
            'is_active'  => $subscription->isActive(),
        ]
    ]);
}
```

### Controller — `create` (après paiement validé)
```php
public function create(Request $request)
{
    $request->validate([
        'plan_id'          => 'required|exists:subscription_plans,id',
        'payment_method'   => 'required|in:wave,cinetpay,orange_money,mtn_money',
        'payment_token'    => 'required|string', // Token retourné par la passerelle
        'billing_period'   => 'required|in:monthly,yearly',
    ]);

    // Vérifier le paiement auprès de la passerelle
    $verified = $this->paymentService->verify($request->payment_method, $request->payment_token);

    if (!$verified) {
        return response()->json(['ok' => false, 'message' => 'Paiement non vérifié.'], 422);
    }

    // Créer l'abonnement
    $plan = SubscriptionPlan::find($request->plan_id);
    $subscription = Subscription::create([
        'user_id'    => $request->user()->id,
        'plan_id'    => $plan->id,
        'starts_at'  => now(),
        'expires_at' => $request->billing_period === 'yearly' ? now()->addYear() : now()->addMonth(),
        'is_active'  => true,
    ]);

    return response()->json(['ok' => true, 'subscription' => $subscription]);
}
```

---

## 9. Newsletters

**Fichier :** `app/Http/Controllers/NewsletterController.php`

### Routes dans `routes/api.php`
```php
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/newsletters', [NewsletterController::class, 'index']);
    Route::post('/user/newsletters/{id}/toggle', [NewsletterController::class, 'toggle']);
});
```

### Controller — `index`
```php
public function index(Request $request)
{
    $user = $request->user();

    $newsletters = Newsletter::all()->map(fn($nl) => [
        'id'          => $nl->id,
        'name'        => $nl->name,
        'description' => $nl->description,
        'subscribed'  => $user->newsletters()->where('newsletter_id', $nl->id)->exists(),
    ]);

    return response()->json(['data' => $newsletters]);
}
```

### Controller — `toggle`
```php
public function toggle(Request $request, $id)
{
    $request->validate(['subscribed' => 'required|boolean']);

    $newsletter = Newsletter::findOrFail($id);

    if ($request->subscribed) {
        $request->user()->newsletters()->syncWithoutDetaching([$newsletter->id]);
    } else {
        $request->user()->newsletters()->detach($newsletter->id);
    }

    return response()->json(['ok' => true]);
}
```

### Tables requises
```
newsletters : id, name, description, is_active
newsletter_user : newsletter_id (FK), user_id (FK) [table pivot]
```

---

## 10. Export CSV de la CVthèque

**Fichier :** `app/Http/Controllers/CVController.php`

### Route dans `routes/api.php`
```php
Route::middleware('auth:sanctum')->get('/cv/browse/export', [CVController::class, 'export']);
```

### Controller
```php
public function export(Request $request)
{
    // Vérification abonnement
    if (!$request->user()->hasActiveSubscription()) {
        return response()->json(['ok' => false, 'message' => 'Abonnement requis.'], 403);
    }

    $cvs = CV::query()
        ->when($request->profession, fn($q) => $q->where('profession', $request->profession))
        ->when($request->country, fn($q) => $q->where('country', $request->country))
        ->get();

    $csv = "Nom,Email,Téléphone,Profession,Expérience,Pays,Disponibilité,Contrat\n";
    foreach ($cvs as $cv) {
        $csv .= "\"{$cv->first_name} {$cv->last_name}\",{$cv->email},{$cv->phone},{$cv->profession},{$cv->experience},{$cv->country},{$cv->availability},{$cv->contract}\n";
    }

    return response($csv, 200, [
        'Content-Type'        => 'text/csv',
        'Content-Disposition' => 'attachment; filename="cvtheque-export.csv"',
    ]);
}
```

---

---

# 🔵 UTILE — Améliorations expérience utilisateur

---

## 11. Préférences utilisateur (thèmes + pays)

**Fichier :** `app/Http/Controllers/UserController.php`

### Route dans `routes/api.php`
```php
Route::middleware('auth:sanctum')->patch('/user/preferences', [UserController::class, 'updatePreferences']);
```

### Controller
```php
public function updatePreferences(Request $request)
{
    $request->validate([
        'slugs'   => 'nullable|array',
        'slugs.*' => 'string',
        'country' => 'nullable|string|max:100',
    ]);

    $request->user()->preferences()->updateOrCreate(
        ['user_id' => $request->user()->id],
        [
            'topic_slugs' => json_encode($request->slugs ?? []),
            'country'     => $request->country,
        ]
    );

    return response()->json(['ok' => true]);
}
```

---

## 12. Historique de lecture

**Fichier :** `app/Http/Controllers/UserController.php`

### Route dans `routes/api.php`
```php
Route::middleware('auth:sanctum')->post('/user/reading-history', [UserController::class, 'addHistory']);
```

### Controller
```php
public function addHistory(Request $request)
{
    $request->validate(['article_id' => 'required']);

    ReadingHistory::updateOrCreate(
        ['user_id' => $request->user()->id, 'article_id' => $request->article_id],
        ['read_at' => now()]
    );

    return response()->json(['ok' => true]);
}
```

---

## 13. Préférences de notifications

**Fichier :** `app/Http/Controllers/NotificationController.php`

### Route dans `routes/api.php`
```php
Route::middleware('auth:sanctum')->post('/user/notification-preferences', [NotificationController::class, 'savePreferences']);
```

### Controller
```php
public function savePreferences(Request $request)
{
    $request->user()->notificationPreferences()->updateOrCreate(
        ['user_id' => $request->user()->id],
        ['preferences' => json_encode($request->all())]
    );

    return response()->json(['ok' => true]);
}
```

### Format envoyé par l'app
```json
{
  "breaking": true,
  "actualites": true,
  "emploi": false,
  "magazine": true
}
```

---

## 14. Suggestions de recherche / tendances

**Fichier :** `app/Http/Controllers/SearchController.php`

### Route dans `routes/api.php`
```php
Route::get('/search/suggestions', [SearchController::class, 'suggestions']);
```

### Controller
```php
public function suggestions()
{
    // Option A : les 10 tags les plus utilisés
    $tags = Article::selectRaw('JSON_UNQUOTE(JSON_EXTRACT(tags, "$[*]")) as tag, COUNT(*) as count')
        ->groupBy('tag')->orderByDesc('count')->limit(10)->pluck('tag');

    // Option B : requêtes de recherche les plus fréquentes (si vous les loggez)

    return response()->json(['data' => $tags]);
}
```

### Réponse attendue
```json
{
  "data": ["paludisme", "vaccination", "nutrition", "diabète", "hypertension"]
}
```

---

## 15. Liste des partenaires (dynamique)

**Fichier :** `app/Http/Controllers/PartnerController.php`

### Route dans `routes/api.php`
```php
Route::get('/partners', [PartnerController::class, 'index']);
```

### Controller
```php
public function index()
{
    $partners = Partner::where('is_active', true)->orderBy('order')->get();
    return response()->json(['data' => $partners]);
}
```

### Table `partners` requise
```
id, name, logo_url, website_url, category, is_active, order
```

---

## 16. Kit Média (données dynamiques)

**Fichier :** `app/Http/Controllers/PartnerController.php`

### Route dans `routes/api.php`
```php
Route::get('/kit-media', [PartnerController::class, 'kitMedia']);
```

### Controller
```php
public function kitMedia()
{
    return response()->json([
        'objectives' => KitMediaSection::where('type', 'objective')->get(),
        'targets'    => KitMediaSection::where('type', 'target')->get(),
        'channels'   => KitMediaSection::where('type', 'channel')->get(),
        'stats'      => KitMediaSection::where('type', 'stat')->get(),
    ]);
}
```

---

---

# Résumé des routes à ajouter dans `routes/api.php`

```php
// ── AUTH ─────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/refresh-token',          [AuthController::class,        'refresh']);
    Route::post('/user/change-password',   [AuthController::class,        'changePassword']);
});

// ── UTILISATEUR ──────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::patch('/user/profile',          [UserController::class,        'update']);
    Route::patch('/user/preferences',      [UserController::class,        'updatePreferences']);
    Route::post('/user/reading-history',   [UserController::class,        'addHistory']);
    Route::get('/user/subscription',       [SubscriptionController::class,'active']);          // ← normaliser sur cet unique endpoint
    Route::get('/user/applications',       [JobController::class,         'myApplications']);
    Route::get('/user/newsletters',        [NewsletterController::class,  'index']);
    Route::post('/user/newsletters/{id}/toggle', [NewsletterController::class, 'toggle']);
    Route::post('/user/notification-preferences', [NotificationController::class, 'savePreferences']);
});

// ── MAGAZINE ─────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/magazine/issues/{id}/reader-url', [MagazineController::class, 'readerUrl']);
});

// ── EMPLOI ───────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/jobs/{id}/apply',        [JobController::class,         'apply']);
});

// ── CVthèque ─────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->get('/cv/browse/export', [CVController::class, 'export']);

// ── ABONNEMENT ───────────────────────────────────────────────────
Route::middleware('auth:sanctum')->post('/subscriptions/create', [SubscriptionController::class, 'create']);

// ── NOTIFICATIONS ────────────────────────────────────────────────
Route::post('/push-token',             [NotificationController::class, 'store']); // public

// ── SEARCH ───────────────────────────────────────────────────────
Route::get('/search/suggestions',      [SearchController::class,       'suggestions']); // public

// ── PARTENAIRES ──────────────────────────────────────────────────
Route::get('/partners',                [PartnerController::class,      'index']); // public
Route::get('/kit-media',               [PartnerController::class,      'kitMedia']); // public
```

---

# Tableau de bord final

| # | Endpoint | Fichier Laravel | Priorité | Statut |
|---|----------|-----------------|----------|--------|
| 1 | Sécurité `GET /articles/{id}` premium | `ArticleController.php` | 🔴 Critique | À corriger |
| 2 | `POST /push-token` | `NotificationController.php` | 🔴 Critique | À créer |
| 3 | `POST /refresh-token` | `AuthController.php` | 🔴 Critique | À créer |
| 4 | `POST /user/change-password` | `AuthController.php` | 🔴 Critique | À créer |
| 5 | `GET /magazine/issues/{id}/reader-url` | `MagazineController.php` | 🟡 Important | À corriger |
| 6 | `PATCH /user/profile` | `UserController.php` | 🟡 Important | À créer |
| 7 | `GET /user/applications` | `JobController.php` | 🟡 Important | À créer |
| 8 | `POST /jobs/{id}/apply` | `JobController.php` | 🟡 Important | À créer |
| 9 | `GET /user/subscription` (stable) | `SubscriptionController.php` | 🟡 Important | À normaliser |
| 10 | `POST /subscriptions/create` | `SubscriptionController.php` | 🟡 Important | À créer |
| 11 | `GET /user/newsletters` | `NewsletterController.php` | 🟡 Important | À créer |
| 12 | `POST /user/newsletters/{id}/toggle` | `NewsletterController.php` | 🟡 Important | À créer |
| 13 | `GET /cv/browse/export` | `CVController.php` | 🟡 Important | À créer |
| 14 | `PATCH /user/preferences` | `UserController.php` | 🔵 Utile | À créer |
| 15 | `POST /user/reading-history` | `UserController.php` | 🔵 Utile | À créer |
| 16 | `POST /user/notification-preferences` | `NotificationController.php` | 🔵 Utile | À créer |
| 17 | `GET /search/suggestions` | `SearchController.php` | 🔵 Utile | À créer |
| 18 | `GET /partners` | `PartnerController.php` | 🔵 Utile | À créer |
| 19 | `GET /kit-media` | `PartnerController.php` | 🔵 Utile | À créer |
