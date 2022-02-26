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
 

# Commencement d'une Séance 
Lorsque une séance est créée à l'issuew d'une authentification, un objet réprestant la séance est stocké dans le serveur. Cet objet contient les informations suivantes: 
- Id de la séance 
- img (la photo de l'étudiant)
- NE ( Numéro étudiant8 )
- Name 
- Start_date (l'heure du commencement de la séance)
- End_date (l'heure )
- camera-view (Si le caméra de vue est connecté ou pas)
- screen-in-view (S'il y a un écran dans la vue)

Après l'autentification l'étudiant connecte le téléphone au serveur en utilisant l'id de la séance. une fois le téléphone est connecté, le téléphone envois des signaux au serveur pour manipuler (screen-in-view). Il faut citer que le téléphone est réglé pour faire 15 détection par seconde donc il ne va pas générer un flux important. 

Quand l'étudiant essais de commencer la séance, le serveur vérifie s'il y a un écran dans le caméra de vue sinon l'étudiant ne peut pas commencer la séance. 

# Génération des alarmes 
Chaque client (le téléphone, le desktop) génère des alarmes selon des protocoles. Chaque client dispose un model pour implémenter le protocole. Le desktop dispose un model de reconnaissance facial et le téléphone dispose un model de reconnaissance d'objet. 
Les protocoles actuels sont les suivants: 
### Téléphone 
- Détection de deux écran au meme temp 
- Détection d'une personne 
### Desktop 
- Détection d'un visage différent du visage de l'étudiant 
- Détection de plusieurs visage au meme temps 
Chaque alarme est envoyé accompagné d'une capture de caméra et du type de cet alarme. Pour restreindre le nobmre des cas faux positives chaque client limite les alarmes générer à 10 alarmes par minutes. 


## Point d'amélioration 

- un caméra bloqué ( si un des caméras est bloqué le système doit générer une alarme ) 

- Chargé le model de reconaissance facial avec plusieurs photo des ongles différents pour améliorer la précsion du model 

- Si un écran n'est pas détecté pour une longue durée du temps depuis la caméra de vision 
 
- introduire le concept de minimum durée par exemple générer une alarme si une persone est détecté N fois pendant M secondes. Ca doit diminuer le nobmres de cas faux positives par ce que le système actuel génére une alarme à l'issue d'une seule détection 


