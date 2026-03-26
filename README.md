# Roomie V3

Roomie V3 is an Expo app for student and landlord room listings. The app uses Firebase for authentication, listings, favorites, chat, and shared app data.

## Run The App

From the project folder:

```bash
npm install
npx expo start
```

You can also run a specific target:

```bash
npx expo start --ios
npx expo start --android
npx expo start --web
```

## Shared Firebase Setup

This project already uses one shared Firebase project.

If you are sharing your Firebase account or project with teammates, they should not create a new Firebase project and they should not create a new database.

Your teammates should use the same Firebase config values so everyone sees the same:

- users
- listings
- saved items
- chats
- messages

Shared Firebase `.env` values:



1. Clone or download this project.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Paste in the same Firebase config values used by the team.
5. Run `npx expo start`.

## Firebase Console Checklist

Only do this on the existing shared Firebase project:

1. Enable `Email/Password` in Authentication
2. Use the existing Firestore database
3. Use the existing Storage bucket

Also apply the rules from these files:

- `firebase/firestore.rules`
- `firebase/storage.rules`

## Notes

- Do not commit the real `.env` file. It is already ignored in `.gitignore`.

