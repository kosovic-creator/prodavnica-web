# Email Verifikacija - Instrukcije za podešavanje

## Pregled
Sistem za email verifikaciju je implementiran sa sledećim funkcionalnostima:
- Slanje verifikacionog email-a pri registraciji
- Verifikacija email adrese putem linka
- Blokiranje prijave neverifikovanih korisnika
- Ponovno slanje verifikacionog email-a

## Podešavanje Email Konfiguracije

### 1. Gmail (Preporučeno za produkciju)
```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"
EMAIL_FROM="drasko.kosovic@gmail.com"
EMAIL_FROM_NAME="Prodavnica"
```

**Napomene za Gmail:**
1. Omogućite 2-factor autentifikaciju
2. Generirajte "App Password" umesto korišćenja obične lozinke
3. Koristite App Password u EMAIL_PASS polju

### 2. Outlook/Hotmail
```env
EMAIL_HOST="smtp-mail.outlook.com"
EMAIL_PORT="587"
EMAIL_USER="your_email@outlook.com"
EMAIL_PASS="your_password"
EMAIL_FROM="your_email@outlook.com"
EMAIL_FROM_NAME="Prodavnica"
```

### 3. Yahoo
```env
EMAIL_HOST="smtp.mail.yahoo.com"
EMAIL_PORT="587"
EMAIL_USER="your_email@yahoo.com"
EMAIL_PASS="your_app_password"
EMAIL_FROM="your_email@yahoo.com"
EMAIL_FROM_NAME="Prodavnica"
```

### 4. Ethereal Email (Za testiranje)
Ethereal Email je besplatan test email servis koji možete koristiti tokom razvoja:

1. Idite na https://ethereal.email/
2. Kliknite "Create Ethereal Account"
3. Kopirajte generirane podatke u .env.local:

```env
EMAIL_HOST="smtp.ethereal.email"
EMAIL_PORT="587"
EMAIL_USER="generated_username"
EMAIL_PASS="generated_password"
EMAIL_FROM="generated_username"
EMAIL_FROM_NAME="Prodavnica Test"
```

**Prednosti Ethereal Email-a:**
- Odmah dostupan bez registracije
- Prikazuje poslate email-ove u web interfejsu
- Idealan za testiranje
- Besplatan

## Kako funkcioniše

### 1. Registracija
- Korisnik se registruje sa email adresom
- Generiše se jedinstveni verifikacijski token
- Šalje se email sa linkom za verifikaciju
- Token je valjan 24 sata

### 2. Verifikacija
- Korisnik klika na link u email-u
- Server proverava token
- Označava email kao verifikovan
- Briše verifikacijski token

### 3. Prijava
- Sistem proverava da li je email verifikovan
- Blokira prijavu ako email nije verifikovan
- Prikazuje poruku sa instrukcijama

### 4. Ponovno slanje
- Korisnik može zatražiti novi verifikacijski email
- Generiše se novi token
- Šalje se novi email

## API Endpoints

### POST /api/auth/register
Registruje novog korisnika i šalje verifikacijski email.

### GET /api/auth/verify-email?token=TOKEN
Verifikuje email adresu koristeći token.

### POST /api/auth/resend-verification
Šalje novi verifikacijski email.

## Stranice

### /register
Stranica za registraciju koja prikazuje poruku o slanju email-a.

### /login
Stranica za prijavu sa porukom o verifikaciji i linkom za ponovno slanje.

### /resend-verification
Stranica za ponovno slanje verifikacionog email-a.

## Baza podataka

### User model - Nova polja:
```prisma
model User {
  // postojeća polja...
  emailVerified     Boolean    @default(false)
  emailVerifyToken  String?    @unique
  emailVerifyExpiry DateTime?
  // postojeća polja...
}
```

## Testiranje

1. Podesite email konfiguraciju (preporučuje se Ethereal Email za testiranje)
2. Registrujte se na /register
3. Proverite email (za Ethereal, idite na https://ethereal.email/messages)
4. Kliknite na verifikacijski link
5. Prijavite se na /login

## Bezbednost

- Verifikacijski tokeni imaju rok od 24 sata
- Tokeni su kriptografski bezbedni (32 bajta random hex)
- Email adrese moraju biti verifikovane pre prijave
- Stari tokeni se brišu nakon verifikacije

## Troubleshooting

### Email se ne šalje
1. Proverite email konfiguraciju u .env.local
2. Proverite da li su credentials ispravni
3. Za Gmail, proverite da li koristite App Password

### Token je nevažeći
1. Proverite da li je token istekao (24h)
2. Zatražite novi verifikacijski email

### Greška pri verifikaciji
1. Proverite database konekciju
2. Proverite da li user postoji u bazi
