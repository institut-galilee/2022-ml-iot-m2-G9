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

  - Au début de l'examen, l'utilisateur doit avoir un écran en vue pour vérifier que la caméra de vision est correctement positionnée. 
  - Une alarme se déclenche si le système détecte plus d'un visage ou un visage différent de l'étudiant.
  - Une alarme se déclanche si le système détecte plus d'un écran.
  - Une alame se déclanche si le sysème détecte un visage à partir de la caméra de vision. 
  - Dans tous les cas où une alarme s'est déclanché on stocke les données selon les quels l'alarme est déclanché (photo, enregistrement, etc.)
 
