# releases
Hacky angular app for keeping track of releases
 
# Configuration
Update the Firebase url in `public/releases-config.js`

```
/** Where the firebase db is */
config.constant('FirebaseUrl', 'https://tepid-water-1234.firebaseio.com');
```

If you want to prevent public access to the Firebase DB:
  - Revoke access in the Firebase Rules
```
  {
      "rules": {
          ".read": false,
          ".write": false
      }
  }
```

  - Add your Firebase secret to `public/releases-config.js`
```
/** Firebase secret */
config.constant('FirebaseSecret', 'NotPassword');
```
 
# Install
```
npm install
node ./bin/www 
```
