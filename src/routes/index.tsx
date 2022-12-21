import { component$, useStore, useStylesScoped$ } from '@builder.io/qwik'
import type { DocumentHead } from '@builder.io/qwik-city'
import styles from './index.scss'
import { Logo } from '../components/icons/logo'
import { LogoAlt } from '../components/icons/logo-alt'

export default component$(() => {
  useStylesScoped$(styles)
  const state: {
    currentPage: string
    expAppearing: boolean
    skillsAppearing: boolean
    menuActive: boolean
    currentSkill: string
    experience: {
      poste: string
      time: {
        start: Date
        end: Date
      }
      entreprise: string
      description: string
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
        description: `Gestion des serveurs, sécurité et cicd
        Développement Front end en Pug,
        Unity et C#
        Développement Back end en Node JS
        Base de données en RethinkDB`,
        img: 'AppiMonkey.webp',
        job: true,
      },
      {
        poste: 'Web developpeur',
        time: {
          start: new Date('January 2019'),
          end: new Date('July 2019'),
        },
        entreprise: 'BeCode',
        description: `Formation au Front end (Twig, React, Javascript, SCSS)
        Formation au Back end (Node.JS, Laravel, Slim, Wordpress)
        Formation aux outils (Github, Docker)`,
        img: 'logo-becode.webp',
        job: false,
      },
      {
        poste: 'Steward Urbain',
        time: {
          start: new Date('August 2017'),
          end: new Date('August 2018'),
        },
        entreprise: 'Liege Gestion Centre Ville',
        description: `Gestion du parc informatique et encodage des datas`,
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
        description: `Section programmation (PHP, Wordpress, HTML, CSS, Javascript)
        Section graphisme(Photoshop, InDesign, After Effects, Premiere Pro, Illustrator)`,
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
        description: `Initiation à l'électronique
        Introduction à la programmation en Python`,
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
      Outils: [
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
      'Bases de données': [
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
    <>
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
            Experience
          </div>
          <div
            onClick$={() => {
              state.currentPage = 'skills'
              state.menuActive = !state.menuActive
            }}
          >
            Skills
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
          skills
        </div>
        <div
          class={{ 'navbar-items': true }}
          onClick$={() => {
            state.currentPage = 'experience'
          }}
        >
          experiences
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
          <span class={{ 'home-info-post': true }}>Full Stack Développeur</span>
          <span class={{ 'home-info-location': true }}>Liège, Belgique</span>
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
          }}
        >
          Experience
        </h1>
        <div class={{ 'exp-container': true }}>
          {state.experience.map((exp) => {
            return (
              <>
                <div class={{ exp: true }}>
                  <div>
                    <img class={{ 'exp-img': true }} src={exp.img}></img>
                  </div>
                  <div class={{ 'exp-info': true }}>
                    <h2>{exp.entreprise}</h2>
                    <div class={{ 'text-sm': true, capitalize: true }}>
                      {exp.time.start.toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                      }) +
                        ' - ' +
                        exp.time.end.toLocaleDateString('fr-FR', {
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
                    <p class={{ 'exp-info-description': true }}>
                      {exp.description}
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
          }}
        >
          Skills
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
    </>
  )
})

export const head: DocumentHead = {
  title: 'Alexandre Bove - Junior full stack Developer',
}
