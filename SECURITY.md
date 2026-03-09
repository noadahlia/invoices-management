# Configuration de Sécurité

## 1. Row Level Security (RLS) sur Supabase

Pour vraiment sécuriser l'app, vous devez activer RLS sur vos tables et créer des politiques.

### Étape 1: Activer RLS sur chaque table

Dans Supabase Dashboard:
1. Allez sur chaque table (clients, invoices, etc.)
2. Cliquez sur "Enable RLS"
3. Cliquez sur "Create policy"

### Étape 2: Créer les politiques de sécurité

Pour la table `clients`:

```sql
-- Politique pour SELECT (lire ses propres clients)
CREATE POLICY "Users can view their own clients"
ON clients FOR SELECT
USING (auth.uid() = user_id);

-- Politique pour INSERT (créer des clients)
CREATE POLICY "Users can create their own clients"
ON clients FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Politique pour UPDATE (modifier ses propres clients)
CREATE POLICY "Users can update their own clients"
ON clients FOR UPDATE
USING (auth.uid() = user_id);

-- Politique pour DELETE (supprimer ses propres clients)
CREATE POLICY "Users can delete their own clients"
ON clients FOR DELETE
USING (auth.uid() = user_id);
```

Répéter la même chose pour `invoices`, `services`, etc. en remplaçant `clients` par le nom de la table.

### Étape 3: Ajouter la colonne user_id

Assurez-vous que chaque table sensible a une colonne `user_id`:

```sql
ALTER TABLE clients ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE invoices ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE services ADD COLUMN user_id UUID REFERENCES auth.users(id);
```

## 2. Vérifications d'authentification

✅ Le middleware vérifie maintenant les sessions côté serveur
✅ Les Server Actions vérifient les permissions avant chaque opération
✅ Les données sont filtrées par user_id

## 3. Recommandations supplémentaires

1. **Disable Realtime** pour les tables sensibles si vous ne l'utilisez pas
2. **Limitez la clé anonyme** - ne lui donnez accès qu'aux tables publiques
3. **Utilisez une clé service** pour les opérations sensibles côté serveur
4. **Configurez les corsHeaders** correctement dans Supabase
5. **Validez les données** côté serveur (déjà fait dans les Server Actions)

## 4. Tester la sécurité

Pour vérifier que RLS fonctionne:
1. Connectez-vous avec un compte
2. Créez des données
3. Déconnectez-vous
4. Connectez-vous avec un autre compte
5. Vous ne devriez pas voir les données du premier compte

Si vous pouvez voir les données d'autres utilisateurs, c'est qu'il y a un problème avec RLS.
