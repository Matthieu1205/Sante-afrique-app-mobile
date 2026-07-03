# Backend Laravel — Lecture des magazines PDF
**Santé Afrique · À implémenter en priorité**

---

## Flux dans l'app

1. L'utilisateur clique un magazine → écran natif avec cover + sommaire
2. L'abonné connecté clique **LIRE (ABONNÉS)** → l'app appelle `GET /api/magazine/issues/{id}/reader-url` avec son Bearer token
3. Le backend vérifie l'abonnement → retourne une **URL signée temporaire** (30 min) vers le PDF
4. L'app ouvre l'URL dans un WebView → lecture du PDF

---

## Checklist dans l'ordre

- [ ] Lancer la migration
- [ ] Ajouter le disque `private` dans `config/filesystems.php`
- [ ] Mettre à jour le modèle `MagazineIssue`
- [ ] Créer `MagazineController` (4 méthodes)
- [ ] Créer `MagazineAdminController` (upload/delete PDF)
- [ ] Ajouter les routes dans `api.php` et `web.php`
- [ ] Renseigner `read_url` pour chaque numéro en BDD
- [ ] Uploader les PDFs via `POST /api/admin/magazine/{id}/pdf`
- [ ] Tester : appeler `/reader-url` avec Bearer token → ouvrir `pdf_url` dans le navigateur → PDF doit s'afficher

---

## 1. Migration

**`database/migrations/xxxx_add_pdf_fields_to_magazine_issues_table.php`**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('magazine_issues', function (Blueprint $table) {
            // Chemin relatif du PDF sur le disque privé
            // Ex : "magazines/sante-afrique-n23.pdf"
            $table->string('pdf_path')->nullable()->after('cover_url');

            // URL de la page web du numéro sur le site
            // Ex : "https://santeafrique.net/numeros/23"
            $table->string('read_url')->nullable()->after('pdf_path');

            // Extrait texte affiché sur l'écran du numéro (pas un JSON)
            $table->text('extrait')->nullable()->after('read_url');

            // Sommaire JSON : [{"page":4,"title":"Éditorial"},...]
            $table->json('sommaire')->nullable()->after('extrait');
        });
    }

    public function down(): void
    {
        Schema::table('magazine_issues', function (Blueprint $table) {
            $table->dropColumn(['pdf_path', 'read_url', 'extrait', 'sommaire']);
        });
    }
};
```

> ⚠️ Si `extrait` et `sommaire` existent déjà dans la table, retirer ces deux lignes.

```bash
php artisan migrate
```

---

## 2. Disque privé

**`config/filesystems.php`** — ajouter dans `'disks'` :

```php
'private' => [
    'driver'     => 'local',
    'root'       => storage_path('app/private'),
    'visibility' => 'private',
],
```

```bash
mkdir -p storage/app/private/magazines
```

> Les PDFs ne sont **jamais** accessibles via URL publique. Seul le controller peut les lire.

---

## 3. Modèle MagazineIssue

**`app/Models/MagazineIssue.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class MagazineIssue extends Model
{
    protected $fillable = [
        'number', 'label', 'title', 'theme',
        'cover_url', 'pdf_path', 'read_url',
        'price', 'free', 'date',
        'extrait', 'sommaire',
    ];

    protected $casts = [
        'free'     => 'boolean',
        'sommaire' => 'array',  // JSON ↔ tableau PHP automatiquement
        'date'     => 'date',
    ];

    /**
     * Génère une URL signée temporaire vers le PDF (30 minutes).
     * Retourne null si aucun PDF n'est uploadé pour ce numéro.
     */
    public function getPdfSignedUrl(): ?string
    {
        if (!$this->pdf_path) return null;
        if (!Storage::disk('private')->exists($this->pdf_path)) return null;

        return URL::temporarySignedRoute(
            'magazine.pdf.serve',
            now()->addMinutes(30),
            ['issue' => $this->id]
        );
    }

    /**
     * URL de la page web du numéro (calculée si non renseignée).
     */
    public function getWebUrl(): string
    {
        return $this->read_url ?? "https://santeafrique.net/numeros/{$this->number}";
    }
}
```

---

## 4. MagazineController

**`app/Http/Controllers/Api/MagazineController.php`**

```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MagazineIssue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class MagazineController extends Controller
{
    // GET /api/magazine/issues  —  public
    public function index(): JsonResponse
    {
        $issues = MagazineIssue::orderByDesc('date')
            ->select('id', 'number', 'label', 'title', 'theme',
                     'cover_url', 'price', 'free', 'date')
            ->get();

        return response()->json(['data' => $issues]);
    }

    // GET /api/magazine/issues/{id}  —  public
    public function show(MagazineIssue $issue): JsonResponse
    {
        return response()->json([
            'ok'   => true,
            'data' => [
                'id'        => $issue->id,
                'number'    => $issue->number,
                'label'     => $issue->label,
                'title'     => $issue->title,
                'theme'     => $issue->theme,
                'cover_url' => $issue->cover_url,
                'price'     => $issue->price,
                'free'      => $issue->free,
                'date'      => $issue->date?->toDateString(),
                'sommaire'  => $issue->sommaire ?? [],
                'extrait'   => $issue->extrait,
                'read_url'  => $issue->getWebUrl(),
                'pdf_url'   => null,
            ],
        ]);
    }

    // GET /api/magazine/issues/{id}/reader-url  —  auth:sanctum + abonné actif
    public function readerUrl(Request $request, MagazineIssue $issue): JsonResponse
    {
        $user = $request->user();
        $sub  = $user->subscription; // ← adapter au nom réel de la relation

        // ⚠️ Adapter is_active et expires_at aux vrais noms de colonnes
        if (!$sub || !$sub->is_active || $sub->expires_at < now()) {
            return response()->json([
                'ok'      => false,
                'message' => 'Abonnement requis pour lire ce magazine.',
            ], 403);
        }

        $signedUrl = $issue->getPdfSignedUrl();

        if (!$signedUrl) {
            return response()->json([
                'ok'      => false,
                'message' => "Le PDF de ce numéro n'est pas encore disponible.",
            ], 404);
        }

        return response()->json([
            'ok'   => true,
            'data' => [
                'pdf_url'    => $signedUrl,
                'reader_url' => $signedUrl,
                'expires_in' => 1800,
            ],
        ]);
    }

    // GET /magazine/pdf/{id}?expires=xxx&signature=xxx  —  route web signée
    public function servePdf(Request $request, MagazineIssue $issue): Response
    {
        abort_unless($request->hasValidSignature(), 403, 'Lien expiré ou invalide.');
        abort_unless(
            $issue->pdf_path && Storage::disk('private')->exists($issue->pdf_path),
            404, 'PDF introuvable.'
        );

        return response()->file(Storage::disk('private')->path($issue->pdf_path), [
            'Content-Type'        => 'application/pdf',
            'Content-Disposition' => 'inline; filename="sante-afrique-n' . $issue->number . '.pdf"',
            'Cache-Control'       => 'private, max-age=1800',
        ]);
    }
}
```

---

## 5. Upload des PDFs (admin)

**`app/Http/Controllers/Admin/MagazineAdminController.php`**

```php
<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MagazineIssue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MagazineAdminController extends Controller
{
    // POST /api/admin/magazine/{issue}/pdf
    public function uploadPdf(Request $request, MagazineIssue $issue)
    {
        $request->validate(['pdf' => 'required|file|mimes:pdf|max:102400']); // max 100 Mo

        if ($issue->pdf_path && Storage::disk('private')->exists($issue->pdf_path)) {
            Storage::disk('private')->delete($issue->pdf_path);
        }

        $path = $request->file('pdf')->storeAs(
            'magazines',
            "sante-afrique-n{$issue->number}.pdf",
            'private'
        );

        $issue->update(['pdf_path' => $path]);

        return response()->json(['ok' => true, 'pdf_path' => $path]);
    }

    // DELETE /api/admin/magazine/{issue}/pdf
    public function deletePdf(MagazineIssue $issue)
    {
        if ($issue->pdf_path) {
            Storage::disk('private')->delete($issue->pdf_path);
            $issue->update(['pdf_path' => null]);
        }
        return response()->json(['ok' => true]);
    }
}
```

---

## 6. Routes

**`routes/api.php`**

```php
use App\Http\Controllers\Api\MagazineController;
use App\Http\Controllers\Admin\MagazineAdminController;

Route::prefix('magazine')->group(function () {
    Route::get('/issues',         [MagazineController::class, 'index']);
    Route::get('/issues/{issue}', [MagazineController::class, 'show']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/issues/{issue}/reader-url', [MagazineController::class, 'readerUrl']);
    });
});

// Admin — adapter 'admin' au middleware réel du projet
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::post('/magazine/{issue}/pdf',   [MagazineAdminController::class, 'uploadPdf']);
    Route::delete('/magazine/{issue}/pdf', [MagazineAdminController::class, 'deletePdf']);
});
```

**`routes/web.php`**

```php
use App\Http\Controllers\Api\MagazineController;

// IMPORTANT : exclure du middleware CSRF
Route::get('/magazine/pdf/{issue}', [MagazineController::class, 'servePdf'])
     ->name('magazine.pdf.serve')
     ->withoutMiddleware([\App\Http\Middleware\VerifyCsrfToken::class]);
```

---

## 7. Formats JSON exacts attendus par l'app

> ⚠️ L'app lit exactement ces clés. Ne pas les renommer.

**`GET /api/magazine/issues/{id}`**
```json
{
  "ok": true,
  "data": {
    "id": 23,
    "number": 23,
    "label": "Santé Afrique N°23 · Janvier 2024",
    "title": "Titre du numéro",
    "theme": "Thème du numéro",
    "free": false,
    "price": "3500",
    "cover_url": "https://santeafrique.net/storage/covers/n23.jpg",
    "date": "2024-01-15",
    "sommaire": [
      { "page": 4,  "title": "Éditorial" },
      { "page": 6,  "title": "Dossier principal" },
      { "page": 18, "title": "Grand entretien" }
    ],
    "extrait": "Découvrez ce mois-ci notre dossier sur la santé maternelle...",
    "read_url": "https://santeafrique.net/numeros/23",
    "pdf_url": null
  }
}
```

**`GET /api/magazine/issues/{id}/reader-url`** — succès
```json
{
  "ok": true,
  "data": {
    "pdf_url": "https://api.santeafrique.net/magazine/pdf/23?expires=xxx&signature=xxx",
    "reader_url": "https://api.santeafrique.net/magazine/pdf/23?expires=xxx&signature=xxx",
    "expires_in": 1800
  }
}
```

**`GET /api/magazine/issues/{id}/reader-url`** — non abonné (HTTP 403)
```json
{
  "ok": false,
  "message": "Abonnement requis pour lire ce magazine."
}
```

**`GET /api/magazine/issues/{id}/reader-url`** — PDF pas encore uploadé (HTTP 404)
```json
{
  "ok": false,
  "message": "Le PDF de ce numéro n'est pas encore disponible."
}
```

---

## 8. Renseigner read_url en BDD

```sql
UPDATE magazine_issues
SET read_url = CONCAT('https://santeafrique.net/numeros/', number)
WHERE read_url IS NULL;
```

---

## Test via Tinker

```bash
php artisan tinker
```

```php
$issue = MagazineIssue::find(23);
$issue->update(['pdf_path' => 'magazines/sante-afrique-n23.pdf']);
echo $issue->getPdfSignedUrl();
// Copier l'URL et l'ouvrir dans le navigateur → le PDF doit s'afficher
```
