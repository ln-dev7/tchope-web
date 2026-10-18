"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  BookOpen,
  WifiOff,
  Globe,
  Sparkles,
  Plus,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StoreBadges } from "@/components/store-badges"
import { ScreenshotLightbox } from "@/components/screenshot-lightbox"
import { RecipeImage } from "@/components/recipe-image"
import { useLocale } from "@/lib/locale-context"
import { recipes } from "@/data/recipes"

export default function Home() {
  const { locale } = useLocale()
  const fr = locale === "fr"
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(
    null
  )
  const copy = fr
    ? {
        eyebrow: "LES SAVEURS DU CAMEROUN, À VOTRE TABLE.",
        title: (
          <>
            Un peu de chez nous.
            <br />
            <em>Dans chaque plat.</em>
          </>
        ),
        intro:
          "Le ndolé du dimanche. Un poulet DG entre amis. Une recette qu’on découvre. Tchopé vous accompagne, de la première envie à la dernière bouchée.",
        discover: "Faites connaissance avec Tchopé",
        stepsTitle: "Une envie. Quelques ingrédients. À table.",
        stepsIntro:
          "Moins de temps à chercher comment faire. Plus de plaisir à cuisiner.",
        steps: [
          [
            "01",
            "Trouvez le plat qui vous ressemble.",
            "Par région, par ingrédient ou par temps de préparation : retrouvez un classique ou laissez-vous surprendre.",
            "03-search",
          ],
          [
            "02",
            "Préparez juste ce qu’il faut.",
            "Adaptez les portions, consultez les ingrédients et ajoutez ce qu’il vous manque à votre liste de courses.",
            "02-recipe",
          ],
          [
            "03",
            "Prenez le temps de bien cuisiner.",
            "Suivez les étapes, une à une. Le mode cuisson garde votre recette lisible et à portée de main.",
            "06-cooking",
          ],
        ],
        regionsTitle: "Dix régions. Mille façons de se régaler.",
        regionsIntro:
          "Des saveurs du Littoral aux spécialités de l’Ouest, un patrimoine culinaire à découvrir, à cuisiner et à transmettre.",
        weekTitle: (
          <>
            La semaine se prépare.
            <br />
            <em>Le plaisir reste.</em>
          </>
        ),
        weekText:
          "Choisissez vos repas dans le planning. Retrouvez les ingrédients dans votre liste de courses, cochez ce que vous avez déjà et gardez le cap au marché.",
        weekTags: [
          "Vos repas réunis au même endroit",
          "Une liste de courses à cocher",
          "Des portions adaptées à votre table",
        ],
        personalTitle: "Votre carnet. Vos habitudes. Vos recettes.",
        personalText:
          "Mettez vos coups de cœur de côté, ajoutez vos propres recettes et conservez vos idées dans vos notes. Un petit bout de votre cuisine, toujours avec vous.",
        aiTitle: "Un coup de main quand il vous en faut.",
        aiText:
          "Une substitution ? Une technique à comprendre ? TchopAI vous aide à avancer. L’app propose aussi des idées à partir de vos ingrédients et un guidage vocal pour cuisiner.",
        aiNote:
          "Les fonctions IA nécessitent une connexion. Certaines fonctionnalités sont proposées avec Tchopé Pro.",
        faqTitle: "Avant de mettre le tablier.",
        faq: [
          [
            "Est-ce que Tchopé est gratuit ?",
            "Le catalogue de recettes et les fonctions essentielles sont accessibles gratuitement. Des fonctions IA avancées sont proposées avec l’abonnement Tchopé Pro ; les détails et tarifs sont affichés dans l’app.",
          ],
          [
            "Puis-je cuisiner sans Internet ?",
            "Les recettes intégrées à l’application mobile restent consultables hors ligne. Les photos distantes, les vidéos et les fonctions IA nécessitent une connexion.",
          ],
          [
            "L’application est-elle en français et en anglais ?",
            "Oui. Vous pouvez choisir votre langue dans les réglages de l’app, ainsi qu’un thème clair ou sombre.",
          ],
          [
            "Puis-je ajouter mes propres recettes ?",
            "Oui. Le carnet permet de créer vos recettes personnelles et de retrouver vos favoris. Vous pouvez aussi garder vos idées dans les notes.",
          ],
          [
            "Sur quels appareils puis-je utiliser Tchopé ?",
            "Tchopé est disponible sur iPhone, iPad et Android. Une version web permet également de consulter les recettes depuis un navigateur.",
          ],
        ],
      }
    : {
        eyebrow: "THE FLAVOURS OF CAMEROON, AT YOUR TABLE.",
        title: (
          <>
            A little taste of home.
            <br />
            <em>In every dish.</em>
          </>
        ),
        intro:
          "Sunday ndolé. Poulet DG with friends. A recipe you’ve never tried. Tchopé is with you, from that first craving to the very last bite.",
        discover: "Get to know Tchopé",
        stepsTitle: "A craving. A few ingredients. Dinner is served.",
        stepsIntro:
          "Less time figuring things out. More joy in making something good.",
        steps: [
          [
            "01",
            "Find your kind of dish.",
            "Browse by region, ingredient or cooking time. Rediscover an old favourite or try something new.",
            "03-search",
          ],
          [
            "02",
            "Get everything ready.",
            "Adjust the servings, check the ingredients and add what you need to your shopping list.",
            "02-recipe",
          ],
          [
            "03",
            "Make room for the joy of cooking.",
            "Follow your recipe one step at a time. Cooking mode keeps the instructions clear and close at hand.",
            "06-cooking",
          ],
        ],
        regionsTitle: "Ten regions. So many flavours to share.",
        regionsIntro:
          "From the Littoral to the West, discover a culinary heritage worth cooking, enjoying and passing on.",
        weekTitle: (
          <>
            Plan the week.
            <br />
            <em>Keep the joy.</em>
          </>
        ),
        weekText:
          "Choose your meals in the planner. Find the ingredients in your shopping list, check what you already have and head to the market ready.",
        weekTags: [
          "Your meals in one place",
          "A shopping list you can tick off",
          "Servings that fit your table",
        ],
        personalTitle: "Your notebook. Your favourites. Your recipes.",
        personalText:
          "Save the dishes you love, add recipes of your own and collect ideas in your notes. A little piece of your kitchen, always with you.",
        aiTitle: "A helping hand when you need one.",
        aiText:
          "Need a substitute? Unsure about a technique? TchopAI can help you move forward. The app also offers ideas based on your ingredients and voice guidance while you cook.",
        aiNote:
          "AI features require an internet connection. Some features are available with Tchopé Pro.",
        faqTitle: "Before you put your apron on.",
        faq: [
          [
            "Is Tchopé free?",
            "The recipe catalogue and essential features are free. Advanced AI features are available with a Tchopé Pro subscription; details and pricing are shown in the app.",
          ],
          [
            "Can I cook without an internet connection?",
            "Recipes included in the mobile app can be read offline. Remote photos, videos and AI features require an internet connection.",
          ],
          [
            "Is the app available in French and English?",
            "Yes. Choose your language in the app settings, along with a light or dark theme.",
          ],
          [
            "Can I add my own recipes?",
            "Yes. Your cookbook holds your own recipes and saved favourites. You can also keep ideas in your notes.",
          ],
          [
            "Which devices can I use?",
            "Tchopé is available on iPhone, iPad and Android. You can also browse recipes in a web browser.",
          ],
        ],
      }
  function poster(file: string, alt: string, cls = "") {
    const src = `/store-screens/${locale}/${file}.webp`
    return (
      <button
        className={`brand-poster ${cls}`}
        onClick={() => setLightbox({ src, alt })}
        aria-label={`${fr ? "Agrandir" : "Enlarge"} — ${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          width={1206}
          height={2622}
          sizes="(max-width: 700px) 70vw, 360px"
          priority={file === "01-home"}
        />
      </button>
    )
  }
  const showcase = ["ndole", "poulet-dg", "eru", "mbongo-tchobi"]
    .map((id) => recipes.find((r) => r.id === id))
    .filter((r): r is (typeof recipes)[number] => !!r)
  return (
    <div className="brand-site">
      <Header />
      <main id="content">
        <section className="brand-hero">
          <div className="brand-container brand-hero-grid">
            <div className="brand-hero-copy">
              <p className="brand-eyebrow">{copy.eyebrow}</p>
              <h1>{copy.title}</h1>
              <p className="brand-lead">{copy.intro}</p>
              <StoreBadges />
              <p className="brand-platform-note">iPhone · iPad · Android</p>
              <a className="brand-text-link" href="#features">
                {copy.discover}
                <ArrowDown size={17} />
              </a>
            </div>
            <div className="brand-hero-art">
              {poster(
                "01-home",
                fr ? "L’accueil de Tchopé" : "Tchopé home",
                "poster-home"
              )}
              {poster(
                "02-recipe",
                fr ? "La fiche recette" : "Recipe details",
                "poster-recipe"
              )}
              <span className="brand-seal">
                {fr ? (
                  <>
                    Fait pour
                    <br />
                    bien manger.
                  </>
                ) : (
                  <>
                    Made for
                    <br />
                    good food.
                  </>
                )}
              </span>
            </div>
          </div>
          <div className="brand-facts brand-container">
            <span>
              <strong>{recipes.length}</strong>{" "}
              {fr ? "recettes à découvrir" : "recipes to discover"}
            </span>
            <span>
              <strong>10</strong>{" "}
              {fr ? "régions du Cameroun" : "regions of Cameroon"}
            </span>
            <span>
              <Globe size={19} />{" "}
              {fr ? "Français & anglais" : "French & English"}
            </span>
            <span>
              <WifiOff size={19} />{" "}
              {fr ? "Recettes mobiles hors ligne" : "Offline mobile recipes"}
            </span>
          </div>
        </section>
        <section className="brand-journey" id="features">
          <div className="brand-container">
            <div className="brand-section-heading">
              <p className="brand-eyebrow">
                {fr ? "DE L’ENVIE À L’ASSIETTE" : "FROM CRAVING TO COOKING"}
              </p>
              <h2>{copy.stepsTitle}</h2>
              <p>{copy.stepsIntro}</p>
            </div>
            <div className="brand-steps">
              {copy.steps.map(([n, title, text, img], i) => (
                <article
                  className={`brand-step ${i % 2 ? "is-reversed" : ""}`}
                  key={n}
                >
                  <div className="brand-step-visual">{poster(img, title)}</div>
                  <div className="brand-step-copy">
                    <span className="brand-step-number">{n}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="brand-regions" id="recipes">
          <div className="brand-container">
            <div className="brand-section-heading">
              <p className="brand-eyebrow">
                {fr ? "UN PATRIMOINE À PARTAGER" : "A HERITAGE TO SHARE"}
              </p>
              <h2>{copy.regionsTitle}</h2>
              <p>{copy.regionsIntro}</p>
            </div>
            <div className="brand-food-grid">
              {showcase.map((r) => (
                <Link
                  href={`/${locale}/app/recipe/${r.id}`}
                  key={r.id}
                  className="brand-food-card"
                >
                  <div>
                    <RecipeImage
                      recipeId={r.id}
                      category={r.category}
                      alt={r.name}
                      fill
                    />
                  </div>
                  <span>{r.region}</span>
                  <h3>
                    {r.name}
                    <ArrowUpRight size={20} />
                  </h3>
                </Link>
              ))}
            </div>
            <div className="brand-region-names">
              {[
                "Littoral",
                "Ouest",
                "Centre",
                "Sud",
                "Nord",
                "Est",
                "Adamaoua",
                "Extrême-Nord",
                "Nord-Ouest",
                "Sud-Ouest",
              ].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>
          </div>
        </section>
        <section className="brand-week">
          <div className="brand-container brand-split">
            <div>
              <p className="brand-eyebrow">
                {fr ? "DU PLANNING AU MARCHÉ" : "FROM PLANNING TO THE MARKET"}
              </p>
              <h2>{copy.weekTitle}</h2>
              <p className="brand-lead">{copy.weekText}</p>
              <ul>
                {copy.weekTags.map((x) => (
                  <li key={x}>
                    <Check size={20} />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="brand-poster-pair">
              {poster("04-planner", fr ? "Planning des repas" : "Meal planner")}
              {poster("05-shopping", fr ? "Liste de courses" : "Shopping list")}
            </div>
          </div>
        </section>
        <section className="brand-personal" id="screenshots">
          <div className="brand-container brand-split">
            <div className="brand-personal-visual">
              {poster(
                "07-favorites",
                fr ? "Le carnet de recettes" : "Your cookbook"
              )}
            </div>
            <div>
              <p className="brand-eyebrow">
                <BookOpen size={16} />{" "}
                {fr ? "VOTRE PETIT TRÉSOR" : "YOUR LITTLE TREASURE"}
              </p>
              <h2>{copy.personalTitle}</h2>
              <p className="brand-lead">{copy.personalText}</p>
              <div className="brand-small-facts">
                <span>{fr ? "Favoris" : "Favourites"}</span>
                <span>{fr ? "Recettes personnelles" : "Your own recipes"}</span>
                <span>{fr ? "Notes de cuisine" : "Cooking notes"}</span>
              </div>
            </div>
          </div>
        </section>
        <section className="brand-ai">
          <div className="brand-container brand-split">
            <div>
              <p className="brand-eyebrow">
                <Sparkles size={17} /> TCHOPAI
              </p>
              <h2>{copy.aiTitle}</h2>
              <p className="brand-lead">{copy.aiText}</p>
              <p className="brand-fine-print">{copy.aiNote}</p>
              <Link className="brand-button" href={`/${locale}/download`}>
                {fr ? "Découvrir dans l’app" : "Explore in the app"}
                <ArrowUpRight size={18} />
              </Link>
            </div>
            <div className="brand-ai-visual">
              {poster(
                "08-ingredients",
                fr
                  ? "Des idées avec vos ingrédients"
                  : "Ideas from your ingredients"
              )}
            </div>
          </div>
        </section>
        <section className="brand-faq" id="faq">
          <div className="brand-container brand-faq-grid">
            <div>
              <p className="brand-eyebrow">
                {fr ? "BON À SAVOIR" : "GOOD TO KNOW"}
              </p>
              <h2>{copy.faqTitle}</h2>
            </div>
            <div>
              {copy.faq.map(([q, a]) => (
                <details key={q}>
                  <summary>
                    {q}
                    <Plus size={22} />
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <ScreenshotLightbox
        src={lightbox?.src ?? ""}
        alt={lightbox?.alt ?? ""}
        open={!!lightbox}
        onClose={() => setLightbox(null)}
      />
    </div>
  )
}
