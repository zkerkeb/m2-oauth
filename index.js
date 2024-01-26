// Importation des modules nécessaires
const express = require('express'); // Importe Express, un framework pour créer des applications web en Node.js
const passport = require('passport'); // Importe Passport, une bibliothèque d'authentification pour Node.js
const OIDCStrategy = require('passport-openidconnect').Strategy; // Importe la stratégie OpenID Connect pour Passport
const session = require('express-session'); // Importe express-session pour gérer les sessions utilisateur

require('dotenv').config(); // Charge les variables d'environnement depuis le fichier .env
// Crée une nouvelle application Express
const app = express();

// Configuration de la session
app.use(session({
  secret: 'LeaPassionCheval', // Clé secrète utilisée pour signer le cookie de session
  resave: true, // Force la session à être sauvegardée dans le store de session
  saveUninitialized: true // Force une session non initialisée à être sauvegardée dans le store
}));

// Initialisation de Passport pour l'authentification
app.use(passport.initialize()); // Initialise Passport
app.use(passport.session()); // Permet à Passport de gérer les sessions utilisateur

// Fonction pour configurer une stratégie OpenID Connect
function configureOIDCStrategy(name, config) {
  // Utilise Passport pour configurer une stratégie OpenID Connect
  passport.use(name, new OIDCStrategy({
    issuer: config.issuer, // URL de l'émetteur OpenID Connect
    authorizationURL: config.authorizationURL, // URL pour la demande d'autorisation
    tokenURL: config.tokenURL, // URL pour obtenir le token
    userInfoURL: config.userInfoURL, // URL pour obtenir les informations utilisateur
    clientID: config.clientID, // ID client pour l'application OAuth
    clientSecret: config.clientSecret, // Secret client pour l'application OAuth
    callbackURL: config.callbackURL, // URL de callback après l'authentification
    scope: config.scope // Scopes demandés
  }, (issuer, profile, cb) => {
    return cb(null, profile); // Fonction de callback après l'authentification
  }));

  // Définit les routes pour l'authentification avec cette stratégie
  app.get(`/auth/${name}`, passport.authenticate(name)); // Route pour démarrer l'authentification
  app.get(`/callback`, passport.authenticate(name, { failureRedirect: 'http://localhost:3000' }), (req, res) => {
    res.redirect('http://localhost:3000/success'); // Redirection en cas de succès
  });
  
}

// Configuration pour Google
configureOIDCStrategy('google', {
  issuer: 'https://accounts.google.com',   // Remplacez par votre fournisseur OpenID Connect
  authorizationURL: 'https://accounts.google.com/o/oauth2/v2/auth', // URL d'autorisation de votre fournisseur
  tokenURL: 'https://oauth2.googleapis.com/token', // URL de token de votre fournisseur
  userInfoURL: 'https://openidconnect.googleapis.com/v1/userinfo', // URL d'info utilisateur de votre fournisseur
  clientID: process.env.GOOGLE_CLIENT_ID, // Remplacez par votre Client ID
  clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Remplacez par votre Client Secret
  callbackURL: 'http://localhost:3001/callback', // URL de callback après l'authentification
  scope: 'openid profile email' // Les scopes requis
});



passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});


// Route d'authentification
app.get('/auth', passport.authenticate('openidconnect'));

app.get('/serverStatus', (req, res) => {
  
  res.send('Server is running');

});

// Lancez le serveur
app.listen(3001, () => {
  console.log('Serveur démarré sur http://localhost:3001');
});
