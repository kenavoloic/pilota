/////////////////////////////////////////////////////////////////////////
// Version
/////////////////////////////////////////////////////////////////////////
const version = () => 0.16;

const jsonNotes = version => {
  return {
    "Nom": "Pilota !",
    "Objet": "Compteur de points pour les parties de pelote basque.",
    "Version": version,
    "Présentation": "Le juge-arbitre de pelote basque dispose d’un compteur manuel lors des parties. Ce logiciel a pour objectif de le remplacer.",
    "Spécialités": "Toutes les spécialités sauf Rebot et Pasaka, dont le décompte des points est différent.",
    "Score maximal": "Compte tenu de la diversité des spécialités, des installations, des catégories de joueurs, le score maximal varie de 5 points à 40 points. Aussi, la limite du compteur est fixée à 99 points.",
    "Interface" : "L’onglet de couleur permet de sélectionner la couleur d’une équipe. Un clic sur le cadran ou sur le bouton [Plus] permet d’ajouter un point. [Moins] retranche un point. [Zéro] ramène le score à zéro.",
    "Langages": "HTML5, CSS3 et surtout JavaScript."
  };
};

const listeNotes = liste => {
  
  let clefs = Object.keys(liste);
  let retour = clefs.map(x => {
    let titre = document.createElement('dt');
    titre.appendChild(document.createTextNode(x));
    let libelle = document.createElement('dd');
    libelle.appendChild(document.createTextNode(liste[x]));
    return [titre, libelle];
  });

  const reducteur = (acc, valeur) => acc.concat(valeur);
  let tous = retour.reduce(reducteur, []);
  
  let dl = document.createElement('dl');
  tous.forEach(x => dl.appendChild(x));
  return dl;
};

const _creationNotes = (fonctionListeNotes, fonctionJson, fonctionVersion) => fonctionListeNotes(fonctionJson(fonctionVersion()));

const creationNotes = () =>_creationNotes(listeNotes, jsonNotes, version);

/////////////////////////////////////////////////////////////////////////
//Outils pour l’interface
/////////////////////////////////////////////////////////////////////////
const hexadecimalToDecimal = couleur => {
  if(couleur.length == 7){
    return couleur.replace('#','').match(/.{1,2}/g).map(x => parseInt(x, 16));
  } else {
    return couleur.match(/.{1,2}/g).map(x => parseInt(x, 16));
  }
};

const labelFondBordure = couleur => {
  const couleurPleine = 1.0;
  const couleurAllegee = 0.75;
  let hexa = hexadecimalToDecimal(couleur);
  let fond = `rgba(${hexa[0]}, ${hexa[1]}, ${hexa[2]}, ${couleurAllegee})`;
  let bordure = `rgba(${hexa[0]}, ${hexa[1]}, ${hexa[2]}, ${couleurPleine})`;
  return {fond:fond, bordure:bordure};
};

const koloreak = (index) => {  
  // const liste = [{nom:"Gorria",couleur:"#ff2424"}, {nom:"Laranja",couleur:"#ff9224"}, {nom:"Horia", couleur:"#ffff00"}, {nom:"Berdea",couleur:"#00ff00"}, {nom:"Urdina",couleur:"#2491ff"}, {nom:"Morea",couleur:"#ff24ff"}, {nom:"Zuria",couleur:"#ffffff"}, {nom:"Beltza",couleur:"#202020"}];
  
  const liste = [{nom:"Rouge",couleur:"#ff2424"}, {nom:"Orange",couleur:"#ff9224"}, {nom:"Jaune", couleur:"#ffff00"}, {nom:"Vert",couleur:"#00ff00"}, {nom:"Bleu",couleur:"#2491ff"}, {nom:"Violet",couleur:"#ff24ff"}, {nom:"Blanc",couleur:"#ffffff"}, {nom:"Noir",couleur:"#202020"}];  

  let retour = liste[index % liste.length];
  return {nom:retour.nom, couleur:retour.couleur};
};

const suffixeAleatoire = () => (Math.random()+1).toString(36).substring(2,6);

const indexAleatoire = () => Math.floor(Math.random() * 100);

const formatageNombre = nombre => String(nombre).padStart(2, '0');

/////////////////////////////////////////////////////////////////////////
//Objets : compteur et compteurInterface
/////////////////////////////////////////////////////////////////////////
const Compteur = function(_totalPointsGagnants){

  const testTotalPointsGagnants = Math.abs(parseInt(_totalPointsGagnants, 10));
  const totalPointsGagnants = testTotalPointsGagnants > 0 ? testTotalPointsGagnants : 99;
  const plafond = totalPointsGagnants;
  const plancher = 0;
  let scoreActuel = 0;

  const plus = () => {
    return (scoreActuel < plafond) ? ++scoreActuel : plafond;
  };

  const moins = () => {
    return (scoreActuel > plancher) ? --scoreActuel : plancher;
  };

  const zero = () => {
    scoreActuel = 0;
    return scoreActuel;
  };

  const getScore = () => scoreActuel;
  const getPlafond = () => plafond;
  const getPlancher = () => plancher;  

  return {plus, moins, zero, getScore, getPlafond, getPlancher};
};


const CompteurInterface = function(_totalPointsGagnants){

  const compteur = new Compteur(_totalPointsGagnants);
  const indexCouleur = indexAleatoire();

  const identifiant = suffixeAleatoire();
  const suffixe = `_${identifiant}`; 

  const cadre = document.createElement('article');
  const nomCouleur = document.createElement('label');
  const couleur = document.createElement('label');
  const cadran = document.createElement('button');
  const plus = document.createElement('button');
  const moins = document.createElement('button');
  const zero = document.createElement('button');

  cadre.setAttribute('class','cadre');
  cadre.setAttribute('id',identifiant);
  nomCouleur.setAttribute('class','nomCouleur');
  couleur.setAttribute('class','couleur');
  cadran.setAttribute('class','cadran');
  plus.setAttribute('class','plus');
  moins.setAttribute('class','moins');  
  zero.setAttribute('class','remiseAzero');

  let {nom:_nom, couleur:_couleur} = koloreak(indexCouleur);
  couleur.appendChild(document.createTextNode(""));
  nomCouleur.appendChild(document.createTextNode(_nom));
  cadran.appendChild(document.createTextNode(formatageNombre(0)));
  plus.appendChild(document.createTextNode("Plus"));
  moins.appendChild(document.createTextNode("Moins"));
  zero.appendChild(document.createTextNode("Zéro"));
  let {fond:rgbaFond, bordure:rgbaBordure } = labelFondBordure(_couleur);

  couleur.style.backgroundColor = rgbaFond;
  couleur.style.borderColor = rgbaBordure;
  
  cadre.appendChild(nomCouleur);
  cadre.appendChild(couleur);
  cadre.appendChild(cadran);
  cadre.appendChild(plus);
  cadre.appendChild(zero);
  cadre.appendChild(moins);

  cadre.dataset.index = 0;

  plus.addEventListener('click', incrementation);
  cadran.addEventListener('click', incrementation);  
  moins.addEventListener('click', decrementation);
  zero.addEventListener('click', remiseAzero);
  couleur.addEventListener('click', changementCouleur);

  //Écouteurs d’événements
  function incrementation(e) {
    let score = compteur.plus();
    cadran.textContent = formatageNombre(score);    
  }

  function decrementation(e){
    let score = compteur.moins();
    cadran.textContent = formatageNombre(score);
  }

  function remiseAzero(e) {
    let score = compteur.zero();
    cadran.textContent = formatageNombre(score);
  }

  function changementCouleur(e){
    let parent = e.srcElement.parentElement;
    let index = ++parent.dataset.index;
    
    let {nom:_nom, couleur:_couleur} = koloreak(index);
    let {fond:rgbaFond, bordure:rgbaBordure} = labelFondBordure(_couleur);
    couleur.style.backgroundColor = rgbaFond;
    couleur.style.borderColor = rgbaBordure;
    nomCouleur.textContent = _nom;
  }

  //Fonctions publiques => méthodes publiques
  const getIdentifiant = () => identifiant;
  const getCadre = () => cadre;

  return {getCadre, getIdentifiant};
};

/////////////////////////////////////////////////////////////////////////
// Initialisation
/////////////////////////////////////////////////////////////////////////
const principal = document.getElementById('principal');

let scoreMaximum = 99;

const ci1 = new CompteurInterface(scoreMaximum);
const ci2 = new CompteurInterface(scoreMaximum);

principal.appendChild(ci1.getCadre());
principal.appendChild(ci2.getCadre());
