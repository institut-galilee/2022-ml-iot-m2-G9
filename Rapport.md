## Description de l'architecture 
Le système se compose de quatre parties: 
- un serveur 
- une application desktop 
- une application mobile 
- une caméra 
## Description des fontionnalitées de chaque parties :
-  Mobile:
   - Autentification a l'aide des identifiant de l'université (le numéro d'étudiant et son mot de passe de son compte universitaire)
   - Enregistrement de sa voix 
   - Envoie des données(enregistrement vocales ,id + mot de passe)
- Desktop:
  - Authentification à l'aide d'un id de la session saisit par l'étudiant (Session id *)
  - Reconnaisance Faciale
  - Envoies des evenements au serveur *
- Caméra:
  - Reconnaisance d'objet
  - Envoies des evenement au serveur *
- Serveur:
  - Athentification (id+mot de passa + reconnaisance vocal )
  - Generer une Session (Session id)
  - Traitement des evenement 

## Scenarios Traités

  
 
