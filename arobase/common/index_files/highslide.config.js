/**
*	Site-specific configuration settings for Highslide JS
*/
hs.graphicsDir = '/html/highslide/graphics/';
hs.showCredits = false;
hs.outlineType = 'custom';
hs.dimmingOpacity = 0.7;
hs.align = 'center';
hs.registerOverlay({
	html: '<div class="closebutton" onclick="return hs.close(this)" title="Fermer"></div>',
	position: 'top right',
	useOnHtml: true,
	fade: 2 // fading the semi-transparent overlay looks bad in IE
});


// French language strings
hs.lang = {
	cssDirection: 'ltr',
	loadingText: 'Chargement...',
	loadingTitle: 'Cliquer pour annuler',
	focusTitle: 'Cliquer pour amener au premier plan',
	fullExpandTitle: 'Afficher à la taille réelle',
	creditsText: 'Propulsé par <i>Highslide JS</i>',
	creditsTitle: 'Site Web de Highslide JS',
	previousText: 'Précédente',
	nextText: 'Suivante',
	moveText: 'Déplacer',
	closeText: 'Fermer',
	closeTitle: 'Fermer (esc ou Échappement)',
	resizeTitle: 'Redimensionner',
	playText: 'Lancer',
	playTitle: 'Lancer le diaporama (barre d\'espace)',
	pauseText: 'Pause',
	pauseTitle: 'Suspendre le diaporama (barre d\'espace)',
	previousTitle: 'Précédente (flèche gauche)',
	nextTitle: 'Suivante (flèche droite)',
	moveTitle: 'Déplacer',
	fullExpandText: 'Taille réelle',
	number: 'Image %1 sur %2',
	restoreTitle: 'Cliquer pour fermer l\'image, cliquer et faire glisser pour déplacer, utiliser les touches flèches droite et gauche pour suivant et précédent.'
};
