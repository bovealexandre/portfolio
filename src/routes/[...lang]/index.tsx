import { component$, useStore, useStylesScoped$ } from '@builder.io/qwik'
import { DocumentHead } from '@builder.io/qwik-city'
import styles from './index.scss'
import { Logo } from '../../components/icons/logo'
import { LogoAlt } from '../../components/icons/logo-alt'

import { $translate as t, Speak, useSpeakLocale } from 'qwik-speak'
import { ChangeLocale } from '~/components/change-local'

export default component$(() => {
  const loc = useSpeakLocale()
  useStylesScoped$(styles)
  const state: {
    currentPage: string
    expAppearing: boolean
    skillsAppearing: boolean
    menuActive: boolean
    currentSkill: string
    experience: {
      technos: string[] | string | any | undefined
      poste: string
      time: {
        start: Date
        end: Date
      }
      entreprise: string
      description: {
        'fr-FR': string
        'en-EN': string
        'nl-NL': string
        'it-IT': string
        'sp-SP': string
      }
      img: string
      job: boolean
    }[]
    skills: {
      [key: string]: any
    }
  } = useStore({
    currentPage: 'home',
    expAppearing: false,
    skillsAppearing: false,
    menuActive: false,
    currentSkill: 'none',
    experience: [
      {
        poste: 'Full Stack Développeur',
        time: {
          start: new Date('July 2019'),
          end: new Date('January 2021'),
        },
        entreprise: 'Mwesto Labs - AppiMonkey',
        technos: ['Docker', 'Unity', 'C#', 'NodeJS', 'RethinkDB', 'Pug'],
        description: {
          'fr-FR': `En tant que full stack développeur stagiaire chez Mwesto Labs, j'ai eu l'opportunité d’être encadré par une équipe de développeurs talentueux sur AppiMonkey, une application SaaS. J'ai également développé une régie publicitaires, des concours en temps réel et des jeux en réalité augmentée pour nos clients et j'ai travaillé en étroite collaboration avec notre équipe de designers pour assurer une expérience utilisateur exceptionnelle.
          Après quelques mois j’ai été promu lead développeur, j'ai été responsable de gérer les serveurs, le CICD et tout le développement seul. Par après, deux stagiaires sont venus pour apprendre les bases du métier.`,
          'en-EN': `
          As a full stack developer intern at Mwesto Labs, I had the opportunity to be mentored by a team of talented developers on AppiMonkey, a SaaS application. I also developed advertising, real-time contests and augmented reality games for our clients and worked closely with our design team to ensure an exceptional user experience.
          After a few months I was promoted to lead developer, I was responsible for managing the servers, the CICD and all the development alone. Afterwards, two trainees came to learn the basics of the job.`,
          'nl-NL': `
          Als full-stack developer-stagiair bij Mwesto Labs kreeg ik de kans om begeleid te worden door een team van getalenteerde ontwikkelaars op AppiMonkey, een SaaS-applicatie. Ik ontwikkelde ook advertenties, real-time wedstrijden en augmented reality-games voor onze klanten en werkte nauw samen met ons ontwerpteam om een uitzonderlijke gebruikerservaring te garanderen.
          Na een paar maanden werd ik gepromoveerd tot hoofdontwikkelaar, ik was alleen verantwoordelijk voor het beheer van de servers, de CICD en de hele ontwikkeling. Daarna kwamen twee stagiaires de basis van het vak leren.`,
          'it-IT': `
          In qualità di stagista sviluppatore full stack da Mwesto Labs, ho avuto l'opportunità di essere guidato da un team di sviluppatori di talento su AppiMonkey, un'applicazione SaaS. Ho anche sviluppato pubblicità, concorsi in tempo reale e giochi di realtà aumentata per i nostri clienti e ho lavorato a stretto contatto con il nostro team di design per garantire un'esperienza utente eccezionale.
          Dopo pochi mesi sono stato promosso a lead developer, ero responsabile della gestione dei server, del CICD e di tutto lo sviluppo da solo. Successivamente, sono venuti due apprendisti per imparare le basi del lavoro.`,
          'sp-SP': `
          Como pasante de desarrollador Full Stack en Mwesto Labs, tuve la oportunidad de ser asesorado por un equipo de desarrolladores talentosos en AppiMonkey, una aplicación SaaS. También desarrollé publicidad, concursos en tiempo real y juegos de realidad aumentada para nuestros clientes y trabajé en estrecha colaboración con nuestro equipo de diseño para garantizar una experiencia de usuario excepcional.
          Después de unos meses fui ascendido a desarrollador líder, yo solo era responsable de administrar los servidores, el CICD y todo el desarrollo. Posteriormente, dos aprendices vinieron a aprender los conceptos básicos del trabajo.`,
        },
        img: 'AppiMonkey.webp',
        job: true,
      },
      {
        poste: 'Web developpeur',
        time: {
          start: new Date('January 2019'),
          end: new Date('July 2019'),
        },
        technos: [
          'Docker',
          'PHP',
          'Slim',
          'Laravel',
          'SCSS',
          'NodeJS',
          'PostgreSQL',
          'Twig',
          'React',
          'Javascript',
        ],
        entreprise: 'BeCode',
        description: {
          'fr-FR': `Pendant ma période au centre de formation BeCode, j'ai eu l'opportunité de me former en tant que développeur full stack. J'ai suivi une formation intensive en apprentissage du code, couvrant les langages de programmation tels que JavaScript, PHP et SCSS.
          Grâce à des projets en groupe, j'ai pu mettre en pratique mes connaissances et développer mes compétences en développement. Le centre de formation m'a également fourni des ressources précieuses et un soutien continu pour m'aider à atteindre mes objectifs professionnels.`,
          'en-EN': `
          During my period at the BeCode training center, I had the opportunity to train myself as a full stack developer. I followed an intensive training in learning to code, covering programming languages such as JavaScript, PHP and SCSS.
          Thanks to group projects, I was able to put my knowledge into practice and develop my development skills. The training center has also provided me with valuable resources and ongoing support to help me achieve my career goals.`,
          'nl-NL': `
          Tijdens mijn periode bij het BeCode opleidingscentrum kreeg ik de kans om mezelf op te leiden tot full stack developer. Ik volgde een intensieve training in het leren coderen, waarin programmeertalen als JavaScript, PHP en SCSS aan bod kwamen.
          Dankzij groepsprojecten heb ik mijn kennis in de praktijk kunnen brengen en mijn ontwikkelingsvaardigheden kunnen ontwikkelen. Het trainingscentrum heeft me ook waardevolle middelen en voortdurende ondersteuning gegeven om me te helpen mijn professionele doelen te bereiken.`,
          'it-IT': `
          Durante il mio periodo al centro di formazione BeCode, ho avuto l'opportunità di formarmi come sviluppatore full stack. Ho seguito una formazione intensiva nell'apprendimento del codice, coprendo linguaggi di programmazione come JavaScript, PHP e SCSS.
          Grazie ai progetti di gruppo ho potuto mettere in pratica le mie conoscenze e sviluppare le mie capacità di sviluppo. Il centro di formazione mi ha inoltre fornito risorse preziose e supporto continuo per aiutarmi a raggiungere i miei obiettivi professionali.`,
          'sp-SP': `
          Durante mi etapa en el centro de formación de BeCode, tuve la oportunidad de formarme como desarrollador full stack. Seguí una formación intensiva en el aprendizaje de la programación, abarcando lenguajes de programación como JavaScript, PHP y SCSS.
          Gracias a los proyectos en equipa, pude poner en práctica mis conocimientos y desarrollar mis habilidades de desarrollo. El centro de formación también me ha proporcionado valiosos recursos y apoyo continuo para ayudarme a alcanzar mis objetivos profesionales.`,
        },
        img: 'logo-becode.webp',
        job: false,
      },
      {
        poste: 'Steward Urbain',
        time: {
          start: new Date('August 2017'),
          end: new Date('August 2018'),
        },
        technos: [],
        entreprise: 'Liege Gestion Centre Ville',
        description: {
          'fr-FR': `Durant ma période où j’ai travaillé à Liège Gestion du Centre Ville, j'ai été en charge de la gestion du parc informatique de l'organisation. Cela incluait l'encodage de datas, l’installation de nouveaux hardwares et la résolution de problèmes techniques.
          Au cours de cette expérience, j'ai développé une grande autonomie de travail et j'ai appris à prendre des décisions rapidement dans un environnement professionnel. J'ai également appris à travailler efficacement en équipe et à communiquer avec mes collègues pour atteindre nos objectifs communs`,
          'en-EN': `
          During my period when I worked at Liège Gestion du Center Ville, I was in charge of managing the organization's IT equipment. This included encoding data, installing new hardware and solving technical problems.
          During this experience, I developed a great autonomy of work and I learned to make decisions quickly in a professional environment. I also learned how to work effectively in a team and how to communicate with my colleagues to achieve our common goals.`,
          'nl-NL': `
          Tijdens mijn periode dat ik bij Liège Gestion du Centre Ville werkte, was ik verantwoordelijk voor het beheer van de IT-apparatuur van de organisatie. Dit omvatte het coderen van gegevens, het installeren van nieuwe hardware en het oplossen van technische problemen.
          Tijdens deze ervaring ontwikkelde ik een grote autonomie in mijn werk en leerde ik snel beslissingen te nemen in een professionele omgeving. Ik heb ook geleerd hoe ik effectief in een team kan werken en hoe ik met mijn collega's kan communiceren om onze gemeenschappelijke doelen te bereiken.`,
          'it-IT': `
          Durante il mio periodo in cui ho lavorato al Liège Gestion du Centre Ville, ero responsabile della gestione delle apparecchiature informatiche dell'organizzazione. Ciò includeva la codifica dei data, l'installazione di nuovo hardware e la risoluzione di problemi tecnici.
          Durante questa esperienza ho sviluppato una grande autonomia di lavoro e ho imparato a prendere decisioni velocemente in un ambiente professionale. Ho anche imparato a lavorare efficacemente in squadra ea comunicare con i miei colleghi per raggiungere i nostri obiettivi comuni.`,
          'sp-SP': `
          Durante mi período en el que trabajé en Liège Gestion du Centre Ville, estaba a cargo de administrar el IT de la organización. Esto incluyó la codificación de datas, la instalación de nuevo hardware y la resolución de problemas técnicos.
          Durante esta experiencia, desarrollé una gran autonomía de trabajo y aprendí a tomar decisiones rápidamente en un entorno profesional. También aprendí a trabajar en equipo de manera efectiva y a comunicarme con mis colegas para lograr nuestros objetivos comunes`,
        },
        img: 'Logo-blanc-sans-fond.webp',
        job: true,
      },
      {
        poste: 'Concepteur Multimedia',
        time: {
          start: new Date('September 2011'),
          end: new Date('June 2013'),
        },
        entreprise: 'IFAPME',
        technos: ['PHP', 'HTML', 'CSS', 'Javascript'],
        description: {
          'fr-FR': `Au cours de ma formation à l'IFAPME, j'ai eu l'opportunité de me familiariser avec les bases de la programmation informatique. J'ai participé à des cours théoriques sur l'introduction à la programmation et j'ai également eu l'occasion de mettre en pratique mes connaissances en utilisant des UML pour analyser et comprendre le code de programmes existants.
          En plus de ma formation en programmation, j'ai également appris les bases du graphisme numérique. J'ai utilisé des outils tels que PHP et WordPress pour créer des sites Web professionnels et attrayants.`,
          'en-EN': `
          During my training at IFAPME, I had the opportunity to familiarize myself with the basics of computer programming. I participated in theoretical courses on the introduction to programming and I also had the opportunity to put my knowledge into practice by using UML to analyze and understand the code of existing programs.
          In addition to my training in programming, I also learned the basics of digital graphics. I used tools such as PHP and WordPress to create professional and attractive websites.`,
          'nl-NL': `
          Tijdens mijn opleiding bij IFAPME kreeg ik de kans om vertrouwd te raken met de basisprincipes van computerprogrammering. Ik nam deel aan theoretische cursussen over de introductie van programmeren en ik kreeg ook de kans om mijn kennis in de praktijk te brengen door UML te gebruiken om de code van bestaande programma's te analyseren en te begrijpen.
          Naast mijn opleiding in programmeren, heb ik ook de basis van digitale grafische afbeeldingen geleerd. Ik gebruikte tools zoals PHP en WordPress om professionele en aantrekkelijke websites te maken.`,
          'it-IT': `
          Durante la mia formazione al IFAPME, ho avuto l'opportunità di familiarizzarmi con le basi della programmazione informatica. Ho partecipato a corsi teorici sull'introduzione alla programmazione e ho avuto anche l'opportunità di mettere in pratica le mie conoscenze utilizzando UML per analizzare e comprendere il codice dei programmi esistenti.
          Oltre alla mia formazione in programmazione, ho appreso anche le basi della grafica digitale. Ho utilizzato strumenti come PHP e WordPress per creare siti web professionali e accattivanti.`,
          'sp-SP': `
          Durante mi formación en IFAPME, tuve la oportunidad de familiarizarme con los conceptos básicos de programación informática. Participé en cursos teóricos de introducción a la programación y también tuve la oportunidad de poner en práctica mis conocimientos utilizando UML para analizar y comprender el código de los programas existentes.
          Además de mi formación en programación, también aprendí los conceptos básicos de gráficos digitales. Usé herramientas como PHP y WordPress para crear sitios web profesionales y atractivos.`,
        },
        img: 'ifapme.webp',
        job: false,
      },
      {
        poste: 'Informatique',
        time: {
          start: new Date('September 2006'),
          end: new Date('June 2008'),
        },
        entreprise: 'Institut Saint-Jean Berchmans',
        technos: ['Python'],
        description: {
          'fr-FR': `Au cours de mon apprentissage scolaire à l'Institut Saint Jean Berchmans, j'ai eu l'opportunité de me familiariser avec les bases de la programmation informatique. J'ai suivi des cours sur l'introduction à la programmation en utilisant le langage Python, et j'ai également participé à des projets de robotique où j'ai mis en pratique mes connaissances en programmation pour contrôler des robots et les faire exécuter différentes tâches.
          En plus de ma formation en programmation et en robotique, j'ai également eu l'occasion de me familiariser avec l'informatique en général. J'ai appris à utiliser différents systèmes d'exploitation et à résoudre des problèmes courants qui peuvent survenir sur un ordinateur. `,
          'en-EN': `
          During my training at the Institut Saint Jean Berchmans, I had the opportunity to familiarize myself with the basics of computer programming. I took courses on introduction to programming using the Python language, and I also participated in robotics projects where I applied my programming knowledge to control robots and make them perform different tasks.`,
          'nl-NL': `
          Tijdens mijn opleiding aan het Institut Saint Jean Berchmans kreeg ik de kans om vertrouwd te raken met de basisprincipes van computerprogrammering. Ik volgde cursussen voor introductie tot programmeren met behulp van de Python-taal, en ik nam ook deel aan robotica-projecten waar ik mijn programmeerkennis toepaste om robots te besturen en verschillende taken te laten uitvoeren.`,
          'it-IT': `
          Durante la mia formazione al Institut Saint Jean Berchmans, ho avuto l'opportunità di familiarizzarmi con le basi della programmazione informatica. Ho seguito corsi di introduzione alla programmazione utilizzando il linguaggio Python, e ho anche partecipato a progetti di robotica dove ho applicato le mie conoscenze di programmazione per controllare robot e fargli svolgere compiti diversi.`,
          'sp-SP': `
          Durante mi formación en el Institut Saint Jean Berchmans, tuve la oportunidad de familiarizarme con los conceptos básicos de programación informática. Realicé cursos de introducción a la programación utilizando el lenguaje Python, y también participé en proyectos de robótica donde apliqué mis conocimientos de programación para controlar robots y hacerlos realizar diferentes tareas.`,
        },
        img: 'header_transparent.webp',
        job: false,
      },
    ],
    skills: {
      Frontend: [
        {
          techno: 'React',
          description: `React est une bibliothèque JavaScript libre développée par Facebook depuis 2013. Le but principal de cette bibliothèque est de faciliter la création d'application web monopage, via la création de composants dépendant d'un état et générant une page HTML à chaque changement d'état.
          React est une bibliothèque qui ne gère que l'interface de l'application, considéré comme la vue dans le modèle MVC. Elle peut ainsi être utilisée avec une autre bibliothèque ou un framework MVC comme AngularJS. La bibliothèque se démarque de ses concurrents par sa flexibilité et ses performances, en travaillant avec un DOM virtuel et en ne mettant à jour le rendu dans le navigateur qu'en cas de nécessité.`,
          link: 'https://fr.reactjs.org/',
        },
        {
          techno: 'AstroJS',
          description: `Astro est un nouveau type de constructeur de site statique qui offre des performances ultra-rapides avec une expérience de développement moderne. Vous pouvez construire votre site en utilisant React, Svelte, Vue, Preact, des composants Web ou tout simplement HTML + JavaScript. Astro rend votre page entière en HTML statique, supprimant par défaut tout JavaScript de votre version finale.`,
          link: 'https://astro.build/',
        },
        {
          techno: 'HTML',
          description: `Le HyperText Markup Language est le langage de balisage conçu pour représenter les pages web.

        Ce langage permet d’écrire de l’hypertexte (d’où son nom), de structurer sémantiquement une page web, de mettre en forme du contenu, de créer des formulaires de saisie ou encore d’inclure des ressources multimédias dont des images, des vidéos, et des programmes informatiques. L'HTML offre également la possibilité de créer des documents interopérables avec des équipements très variés et conformément aux exigences de l’accessibilité du web. `,
          link: '#',
        },
        {
          techno: 'Javascript',
          description:
            'JavaScript est un langage de programmation de scripts principalement employé dans les pages web interactives et à ce titre est une partie essentielle des applications web. En outre, les fonctions sont des objets de première classe. Le langage supporte le paradigme objet, impératif et fonctionnel.',
          link: 'https://www.javascript.com/',
        },
        {
          techno: 'Unity',
          description:
            "Unity est un moteur de jeu multiplateforme (smartphone, ordinateur, consoles de jeux vidéo et Web) développé par Unity Technologies. Il est l'un des plus répandus dans l'industrie du jeu vidéo, aussi bien pour les grands studios que pour les indépendants du fait de sa rapidité aux prototypages et qu'il permet de sortir les jeux sur tous les supports. ",
          link: 'https://unity.com/',
        },
        { techno: 'CSS', description: '', link: '#' },
        {
          techno: 'SCSS',
          description:
            'Sass est un langage de script préprocesseur qui est compilé ou interprété en CSS . Sass est disponible en deux syntaxes. La nouvelle syntaxe, «SCSS», utilise les mêmes séparateurs de blocs que CSS. Les fichiers de la syntaxe indentée et SCSS utilisent respectivement les extensions .sass et .scss.',
          link: 'https://sass-lang.com/',
        },
        {
          techno: 'VueJS',
          description:
            "Vue.js , est un framework JavaScript open-source utilisé pour construire des interfaces utilisateur et des applications web monopages. Les fonctionnalités avancées requises pour les applications complexes telles que le routage, la gestion d'état et les outils de construction sont offertes par le biais de bibliothèques et de paquets officiellement maintenus, Nuxt.js étant l'une des solutions les plus populaires. Les directives offrent des fonctionnalités aux applications HTML, et sont soit intégrées soit définies par l'utilisateur.",
          link: 'https://vuejs.org/',
        },
        {
          techno: 'Qwik',
          description:
            "Qwik est un framework d'applications Web centré sur le DOM, conçu pour le meilleur temps d'interaction possible, en se concentrant sur la possibilité de reprendre le rendu côté serveur du code HTML et le lazy loading en réduisant au maximum le code dans plusieurs fichiers. Le concept de base de Qwik est de se concentrer sur la métrique du temps d'interaction en retardant autant que possible JavaScript pour tirer parti des capacités de lazy loading du navigateur. L'objectif de Qwik est de réduire le temps d'interaction en un clin d'œil sur l'appareil mobile le plus lent",
          link: 'https://qwik.builder.io/',
        },
        {
          techno: 'Svelte',
          description:
            'Svelte est un framework JavaScript offrant une approche productive pour faciliter la création d’interfaces frontend. Le principal avantage technique de Svelte est qu’il effectue la majeure partie de son travail lors de la compilation, ce qui se traduit par un JavaScript performant et convivial pour les navigateurs, avec des paquets de petite taille.',
          link: 'https://svelte.dev/',
        },
        {
          techno: 'Twig',
          description:
            'Twig est un moteur de templates pour le langage de programmation PHP, utilisé par défaut par le framework Symfony.',
          link: 'https://twig.symfony.com/',
        },
        {
          techno: 'Blazor',
          description: `Blazor est un framework Web .NET pour créer des applications Web clientes avec C#.

        Blazor vous permet de créer des interfaces utilisateur Web interactives en utilisant C # au lieu de JavaScript. Les applications Blazor sont composées de composants d'interface utilisateur Web réutilisables implémentés à l'aide de C#, HTML et CSS. Le code client et serveur est écrit en C #, ce qui vous permet de partager du code et des bibliothèques.`,
          link: 'https://dotnet.microsoft.com/en-us/apps/aspnet/web-apps/blazor',
        },
      ],
      Backend: [
        {
          techno: 'NodeJS',
          description: `En tant qu'environnement d'exécution JavaScript asynchrone piloté par les événements, Node.js est conçu pour créer des applications réseau évolutives. Il présente une boucle d'événements comme une construction d'exécution au lieu d'une bibliothèque. Dans d'autres systèmes, il y a toujours un appel bloquant pour démarrer la boucle d'événements. Node.js entre simplement dans la boucle d'événements après avoir exécuté le script d'entrée.

        Node.js quitte la boucle d'événements lorsqu'il n'y a plus de rappels à effectuer.`,
          link: 'https://nodejs.org',
        },
        {
          techno: 'Laravel',
          description: `Laravel est un framework PHP open source, robuste et facile à comprendre. Il suit un modèle de conception modèle-vue-contrôleur. Laravel réutilise les composants existants de différents frameworks, ce qui aide à créer une application Web. L'application web ainsi conçue est plus structurée et pragmatique.`,
          link: 'https://laravel.com',
        },
        {
          techno: 'PHP',
          description: `PHP est un langage de scripts libre principalement utilisé pour produire des pages Web dynamiques via un serveur HTTP, mais pouvant également fonctionner comme n'importe quel langage interprété de façon locale, en exécutant les programmes en ligne de commande. PHP est un langage impératif disposant depuis la version 5 de fonctionnalités de modèle objet complètes. En raison de la richesse de sa bibliothèque, on désigne parfois PHP comme une plate-forme plus qu'un simple langage.PHP (sigle de PHP: Hypertext Preprocessor), est un langage de scripts libre principalement utilisé pour produire des pages Web dynamiques via un serveur HTTP, mais pouvant également fonctionner comme n'importe quel langage interprété de façon locale, en exécutant les programmes en ligne de commande. PHP est un langage impératif disposant depuis la version 5 de fonctionnalités de modèle objet complètes. En raison de la richesse de sa bibliothèque, on désigne parfois PHP comme une plate-forme plus qu'un simple langage.`,
          link: 'https://www.php.net',
        },
        {
          techno: 'C-Sharp',
          description: `C# est un langage de programmation orientée objet, fortement typé, dérivé de C et de C++, ressemblant au langage Java. Il est utilisé pour développer des applications web, ainsi que des applications de bureau, des services web, des commandes, des widgets ou des bibliothèques de classes. En C#, une application est un lot de classes où une des classes comporte une méthode Main, comme cela se fait en Java. `,
          link: 'https://learn.microsoft.com/en-us/dotnet/csharp/',
        },
        {
          techno: 'Golang',
          description: `Go est un langage de programmation compilé et concurrent inspiré de C et Pascal. S’il vise aussi la rapidité d’exécution, indispensable à la programmation système, il considère le multithreading comme le moyen le plus robuste d’assurer sur les processeurs actuels cette rapidité tout en rendant la maintenance facile par séparation de tâches simples exécutées indépendamment afin d’éviter de créer des « usines à gaz ».`,
          link: 'https://go.dev/',
        },
        {
          techno: 'Slim',
          description: ``,
          link: 'https://www.slimframework.com/',
        },
        {
          techno: 'Prestashop',
          description: ``,
          link: 'https://www.prestashop.com/fr',
        },
        {
          techno: 'Wordpress',
          description: ``,
          link: 'https://wordpress.com/fr/',
        },
      ],
      Tools: [
        { techno: 'Docker', description: ``, link: 'https://www.docker.com/' },
        { techno: 'Github', description: ``, link: 'https://github.com/' },
        {
          techno: 'Gitlab',
          description: ``,
          link: 'https://about.gitlab.com/',
        },
        { techno: 'Webpack', description: ``, link: 'https://webpack.js.org/' },
        {
          techno: 'Photoshop',
          description: ``,
          link: 'https://www.adobe.com/be_fr/products/photoshop.html',
        },
        {
          techno: 'InDesign',
          description: ``,
          link: 'https://www.adobe.com/be_fr/products/indesign.html',
        },
        {
          techno: 'Illustrator',
          description: ``,
          link: 'https://www.adobe.com/be_fr/products/illustrator.html',
        },
        {
          techno: 'Blender',
          description: ``,
          link: 'https://www.blender.org/',
        },
      ],
      Database: [
        { techno: 'SQL', description: ``, link: 'https://sql.sh/' },
        {
          techno: 'RethinkDB',
          description: ``,
          link: 'https://rethinkdb.com/',
        },
        { techno: 'Hasura', description: ``, link: 'https://hasura.io/' },
        {
          techno: 'ArangoDB',
          description: ``,
          link: 'https://www.arangodb.com/',
        },
        {
          techno: 'MongoDB',
          description: ``,
          link: 'https://www.mongodb.com/',
        },
        {
          techno: 'SurrealDB',
          description: ``,
          link: 'https://surrealdb.com/',
        },
      ],
    },
  })

  return (
    <Speak assets={['app']}>
      <div class={{ 'mobile-btn': true, open: state.menuActive }}>
        <div
          onClick$={() => (state.menuActive = !state.menuActive)}
          class={{ 'mobile-btn-click': true }}
        >
          <div class={{ 'mobile-btn-burger': true }}></div>
        </div>

        <div class={{ 'mobile-menu': true }}>
          <div class={{ 'w-1/4': true }}>
            <LogoAlt class="" />
          </div>
          <div
            onClick$={() => {
              state.currentPage = 'experience'
              state.menuActive = !state.menuActive
            }}
          >
            {t('app.experiences')}
          </div>
          <div
            onClick$={() => {
              state.currentPage = 'skills'
              state.menuActive = !state.menuActive
            }}
          >
            {t('app.skills')}
          </div>
        </div>
      </div>
      <nav
        class={{
          navbar: true,
          'navbar-exp': state.currentPage === 'experience',
          'navbar-skills': state.currentPage === 'skills',
          'sm:hidden': true,
        }}
      >
        <div
          class={{ 'navbar-items': true }}
          onClick$={() => {
            state.currentPage = 'skills'
          }}
        >
          {t('app.skills')}
        </div>
        <div
          class={{ 'navbar-items': true }}
          onClick$={() => {
            state.currentPage = 'experience'
          }}
        >
          {t('app.experiences')}
        </div>
      </nav>
      <section class={{ home: true }}>
        <div class={{ me: true }}>
          <div
            class={{
              'me-img': true,
              'me-img-exp': state.currentPage === 'experience',
              'me-img-skills': state.currentPage === 'skills',
            }}
          ></div>
        </div>
        <section
          class={{
            'home-info': true,
            'anim-info-disappear': state.currentPage !== 'home',
          }}
        >
          <Logo class={{ 'home-info-logo': true }}></Logo>
          <span class={{ 'home-info-name': true }}>Alexandre Bove</span>
          <span class={{ 'home-info-post': true }}>{t('app.title')}</span>
          <span class={{ 'home-info-location': true }}>
            {t('app.location')}
          </span>
          <div class={{ 'home-info-social': true }}>
            <a href="https://www.linkedin.com/in/alexandre-bove/">
              <i class="fa-brands fa-linkedin"></i>
            </a>
            <a href="https://github.com/bovealexandre">
              <i class="fa-brands fa-github"></i>
            </a>
            <a href="mailto:alexandre.l.bove@gmail.com?subject=Nous recherchons un développeur !">
              <i class="fa-solid fa-envelope"></i>
            </a>
          </div>
          <ChangeLocale />
        </section>
      </section>
      <section
        class={{
          neumorphism: true,
          hidden: state.currentPage !== 'experience',
          appearing: true,
        }}
      >
        <i
          class="fa-regular fa-circle-xmark float-right cursor-pointer"
          onClick$={() => {
            state.currentPage = 'home'
          }}
        ></i>
        <h1
          class={{
            'pb-2': true,
            'w-3/4': true,
            'text-xl': true,
            'font-medium': true,
            capitalize: true,
          }}
        >
          {t('app.experiences')}
        </h1>
        <div class={{ 'exp-container': true }}>
          {state.experience.map((exp) => {
            return (
              <>
                <div class={{ exp: true }}>
                  <div class={{ 'exp-img-container': true }}>
                    <img class={{ 'exp-img': true }} src={exp.img}></img>
                  </div>
                  <div class={{ 'exp-info': true }}>
                    <h2>{exp.entreprise}</h2>
                    <div class={{ 'text-sm': true, capitalize: true }}>
                      {exp.time.start.toLocaleDateString(loc.lang, {
                        year: 'numeric',
                        month: 'long',
                      }) +
                        ' - ' +
                        exp.time.end.toLocaleDateString(loc.lang, {
                          year: 'numeric',
                          month: 'long',
                        })}
                    </div>
                    <div>
                      {exp.job ? (
                        <i class="fa-solid fa-briefcase"></i>
                      ) : (
                        <i class="fa-solid fa-graduation-cap"></i>
                      )}{' '}
                      {exp.poste}
                    </div>
                    {exp.technos.length != 0 ? (
                      <div class={{ 'exp-info-technos': true }}>
                        {exp.technos.map((techno: string) => (
                          <div class={{ 'exp-info-techno': true }}>
                            {techno}
                          </div>
                        ))}
                      </div>
                    ) : (
                      ''
                    )}
                    <p class={{ 'exp-info-description': true }}>
                      {
                        // @ts-ignore
                        exp.description[loc.lang]
                      }
                    </p>
                  </div>
                </div>
              </>
            )
          })}
        </div>
      </section>

      <section
        class={{
          neumorphism: true,
          hidden: state.currentPage !== 'skills',
          appearing: true,
        }}
      >
        <i
          class="fa-regular fa-circle-xmark float-right cursor-pointer"
          onClick$={() => {
            state.currentPage = 'home'
          }}
        ></i>
        <h1
          class={{
            'pb-2': true,
            'w-3/4': true,
            'text-xl': true,
            'font-medium': true,
            capitalize: true,
          }}
        >
          {t('app.skills')}
        </h1>
        <div class={{ 'skills-container': true }}>
          <div class={{ relative: true }}>
            {Object.keys(state.skills).map((skillCat, index) => {
              return (
                <>
                  <div key={index} class={{ 'skills-title': true }}>
                    {skillCat}
                  </div>
                  <div class={{ 'skills-grid': true }}>
                    {state.skills[skillCat].map(
                      (skill: { techno: string; link: string | undefined }) => (
                        <div
                          class={{
                            'h-auto': state.currentSkill !== skill.techno,
                            'h-28': state.currentSkill === skill.techno,
                            'transition-all': true,
                            'duration-500': true,
                            'ease-in-out': true,
                          }}
                        >
                          <div
                            class={{ 'skills-skill': true }}
                            onClick$={() =>
                              (state.currentSkill =
                                state.currentSkill !== skill.techno
                                  ? skill.techno
                                  : 'none')
                            }
                          >
                            <img
                              src={'skills/' + skill.techno + '.webp'}
                              alt={skill.techno}
                            />
                          </div>
                          <div
                            class={{
                              'skills-desc': true,
                              hidden: state.currentSkill !== skill.techno,
                            }}
                          >
                            <a href={skill.link} target="_blank">
                              <h3 class={{ 'skills-link': true }}>
                                {skill.techno === 'C-Sharp'
                                  ? 'C#'
                                  : skill.techno}
                              </h3>
                            </a>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </>
              )
            })}
          </div>
        </div>
      </section>
    </Speak>
  )
})

export const head: DocumentHead = {
  title: 'Alexandre Bove - Full stack Developer',
}
