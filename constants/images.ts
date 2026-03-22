import type { Category } from '@/types/recipe';

// Wikimedia Commons images (CC license) - authentic Cameroonian dish photos
// Pexels/Unsplash used as fallbacks when no Wikimedia image exists
export const recipeImages: Record<string, string> = {
  // =================== FEATURED / POPULAR ===================
  'ndole': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Ndol%C3%A8_%C3%A0_la_viande%2C_morue_et_crevettes.jpg',
  'poulet-dg': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Poulet_DG.JPG',
  'eru': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Eru_Soup.jpg',
  'kondre': 'https://upload.wikimedia.org/wikipedia/commons/9/9a/Kondr%C3%A8_%C3%A0_la_viande_de_b%C5%93uf.png',
  'koki': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Koki_and_ripe_plantains.jpg',
  'okok': 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Okok.jpg',
  'okok-sale': 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Okok.jpg',
  'poisson-braise': 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Poisson_brais%C3%A9_%C3%A0_la_fa%C3%A7on_du_Cameroun%2C_Kribi.JPG',

  // =================== SAUCES ===================
  'mbongo-tchobi': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Mbongo_Tchobi_%28sauce_noir%29.jpg',
  'sauce-gombo': 'https://upload.wikimedia.org/wikipedia/commons/4/41/Okro_soup.jpg',
  'gombo-boeuf': 'https://upload.wikimedia.org/wikipedia/commons/4/41/Okro_soup.jpg',
  'gombo-crabe': 'https://upload.wikimedia.org/wikipedia/commons/4/41/Okro_soup.jpg',
  'sauce-darachide': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Fufu_accompagn%C3%A9_d%27une_sauce_arachide_au_poulet.JPG',
  'sauce-arachide': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Fufu_accompagn%C3%A9_d%27une_sauce_arachide_au_poulet.JPG',
  'nkui': 'https://upload.wikimedia.org/wikipedia/commons/5/53/Nkui.jpg',
  'egusi': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Eba_and_Egusi_soup.JPG',
  'ndomba': 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Ndomba_de_poulet.jpg',
  'ndomba-de-bar': 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Ndomba_de_poulet.jpg',
  'ndomba-de-porc': 'https://upload.wikimedia.org/wikipedia/commons/1/1c/Ndomba_de_poulet.jpg',

  // =================== GRILLADES ===================
  'soya': 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Suya_meat_in_Northern_Nigeria.jpg',
  'kilishi': 'https://upload.wikimedia.org/wikipedia/commons/9/91/%22Kilishi%22.JPG',

  // =================== ENTRÉES / SALADES ===================
  'salade-avocat': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Salade_avocat_01.jpg',
  'salade-d-avocat': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Salade_avocat_01.jpg',
  'salade-de-fruits-exotiques': 'https://upload.wikimedia.org/wikipedia/commons/2/2e/Tropical_fruit.jpg',
  'boulettes-de-viande': 'https://upload.wikimedia.org/wikipedia/commons/8/89/Boulettes_de_viande%2C_IKEA_Gen%C3%A8ve.jpg',
  'boulettes-de-poisson': 'https://images.pexels.com/photos/390382/pexels-photo-390382.jpeg?auto=compress&cs=tinysrgb&w=600',

  // =================== ACCOMPAGNEMENTS ===================
  'plantain-frit': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Un_plat_d%27alloco_Fried_Plantains.JPG',
  'plantains-frits': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Un_plat_d%27alloco_Fried_Plantains.JPG',
  'beignets': 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Nigerian-puff-puff-recipe_cropped.jpg',
  'beignets-haricots': 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Nigerian-puff-puff-recipe_cropped.jpg',
  'beignets-farine': 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Nigerian-puff-puff-recipe_cropped.jpg',
  'beignets-farine-de-ble': 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Nigerian-puff-puff-recipe_cropped.jpg',
  'beignets-de-mais': 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Nigerian-puff-puff-recipe_cropped.jpg',
  'fufu': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Water_fufu_and_Eru.jpg',
  'water-fufu': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Water_fufu_and_Eru.jpg',
  'foufou-de-manioc': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Water_fufu_and_Eru.jpg',
  'foufou-de-mais': 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Water_fufu_and_Eru.jpg',
  'miondo': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Kwanga.jpg',
  'bobolo': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Kwanga.jpg',
  'baton-de-manioc': 'https://upload.wikimedia.org/wikipedia/commons/4/45/Kwanga.jpg',
  'couscous-de-manioc': 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Couscous_de_mil_blanc_de_l%E2%80%99extr%C3%AAme_nord_du_Cameroun.jpg',
  'couscous-de-mais': 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Couscous_de_mil_blanc_de_l%E2%80%99extr%C3%AAme_nord_du_Cameroun.jpg',
  'ekomba': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Koki_and_ripe_plantains.jpg',

  // =================== PLATS PRINCIPAUX ===================
  'ekwang': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Ekwang.jpg',
  'kati-kati': 'https://upload.wikimedia.org/wikipedia/commons/6/68/Kati-kati.jpg',
  'njama-njama': 'https://upload.wikimedia.org/wikipedia/commons/3/35/Fufu_corn_and_khati_khati.jpg',
  'crevettes-sauce-tomate': 'https://upload.wikimedia.org/wikipedia/commons/4/47/Crevettes_sur_oignons_grill%C3%A9s.jpg',
  'pepper-soup': 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Pepper_soup_in_northern_Nigeria.jpg',
  'ndjapche': 'https://upload.wikimedia.org/wikipedia/commons/5/53/Plat_de_Njapche.jpg',
  'mpele-macabo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Macabo_taro_pil%C3%A9_dans_une_feuille.jpg/960px-Macabo_taro_pil%C3%A9_dans_une_feuille.jpg',
  'ndomba-porc': 'https://upload.wikimedia.org/wikipedia/commons/f/fa/NDOMBA_Light_%28Poisson_cuit_%C3%A0_l%27%C3%A9touff%C3%A9%29.gif',
  'ndomba-vipere': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Snake_soup.jpg/960px-Snake_soup.jpg',
  'nsugi': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Eru_Soup.jpg',
  'okok-sucre': 'https://upload.wikimedia.org/wikipedia/commons/d/db/Fufu_and_Eru.jpg',
  'nnam-olis': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/D%C3%A9gustation_de_koki.jpg/960px-D%C3%A9gustation_de_koki.jpg',
  'nnam-wondo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/D%C3%A9gustation_de_koki.jpg/960px-D%C3%A9gustation_de_koki.jpg',
  'porc-braise': 'https://upload.wikimedia.org/wikipedia/commons/d/df/Smoky_grilled_pork_and_dodo.jpg',
  'poulet-braise': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Poulets_brais%C3%A9.jpg/960px-Poulets_brais%C3%A9.jpg',
  'poulet-roti': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Max%27s_Roasted_Chicken_-_Evan_Swigart.jpg/960px-Max%27s_Roasted_Chicken_-_Evan_Swigart.jpg',
  'riz-jollof': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Jollof_Rice_with_Stew.jpg/960px-Jollof_Rice_with_Stew.jpg',
  'roti-mouton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Roast_Whole_Lamb.jpg/960px-Roast_Whole_Lamb.jpg',
  'taro-sauce-jaune': 'https://upload.wikimedia.org/wikipedia/commons/8/82/Taro_sauce_jaune.jpg',
  'sauce-pistache': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Le_foutou_accompagn%C3%A9_de_sauce_pistache.JPG/960px-Le_foutou_accompagn%C3%A9_de_sauce_pistache.JPG',
  'sauce-tomate-champignons': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Sauce_champignons.jpg/960px-Sauce_champignons.jpg',
  'sauce-oignons': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Pork_tenderloin_with_onion_sauce.jpg/960px-Pork_tenderloin_with_onion_sauce.jpg',
  'spaghettis-sardine': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Spaghetti_au_tomate_plus_la_sardine.jpg/960px-Spaghetti_au_tomate_plus_la_sardine.jpg',
  'queue-boeuf-sauce-arachides': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Slow_Cooker_Oxtail_Stew_%2843369501180%29.jpg/960px-Slow_Cooker_Oxtail_Stew_%2843369501180%29.jpg',
  'pate-arachides': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/P%C3%A2te_d%27rachide.jpg/960px-P%C3%A2te_d%27rachide.jpg',
  'pili-pili': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/African_red_devil_peppers.jpg/960px-African_red_devil_peppers.jpg',
  'pile-plantains': 'https://upload.wikimedia.org/wikipedia/commons/1/1f/Wrapped_fufu.jpg',
  'pile-pommes-de-terre': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Sous_vide_mashed_potatoes.jpg/960px-Sous_vide_mashed_potatoes.jpg',
  'pattes-boeuf-bouillon': 'https://upload.wikimedia.org/wikipedia/commons/5/5a/Khash.jpg',
  'pattes-porc-bouillon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/A_cold_dish_of_pig%27s_trotter.jpg/960px-A_cold_dish_of_pig%27s_trotter.jpg',
  'peau-boeuf-sauce-tomate': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Fresh_Tomato_Sauce_%28Unsplash%29.jpg/960px-Fresh_Tomato_Sauce_%28Unsplash%29.jpg',
  'sanga': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Solanum_scabrum_Psianka_2018-09-02_01.jpg/960px-Solanum_scabrum_Psianka_2018-09-02_01.jpg',
  'tapioca-saute': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Spicy_and_Non_Spicy_Tapioca_Chips.jpeg/960px-Spicy_and_Non_Spicy_Tapioca_Chips.jpeg',
  'muandja-moto': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Elaeis_guineensis_fruits_on_tree.jpg/960px-Elaeis_guineensis_fruits_on_tree.jpg',
  'mbongo-herisson': 'https://upload.wikimedia.org/wikipedia/commons/5/55/Mbongo_tchobi_et_banae_plantin_malx%C3%A9.jpg',

  // =================== BATCH 3 ===================
  'tenue-militaire': 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Beignets_-_Bouillie_-_haricots.jpg',
  'porc-fume-moutarde': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Smoked_Pork_02.jpg/960px-Smoked_Pork_02.jpg',
  'beignets-koki': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Koki_Beans.jpg/960px-Koki_Beans.jpg',
  'beignets-mais': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Barranquilla_bu%C3%B1uelos_de_ma%C3%ADz.jpg/960px-Barranquilla_bu%C3%B1uelos_de_ma%C3%ADz.jpg',
  'bonbon-coconut': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Coconut_Candy_%2852311610055%29.jpg/960px-Coconut_Candy_%2852311610055%29.jpg',
  'caramel-arachide': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Arachides_au_caramel_de_Niamey_au_Niger.jpg/960px-Arachides_au_caramel_de_Niamey_au_Niger.jpg',
  'baton-manioc': 'https://upload.wikimedia.org/wikipedia/commons/5/58/B%C3%A2tons_de_manioc_de_Tayap.JPG',
  'plantains-bouillis': 'https://upload.wikimedia.org/wikipedia/commons/3/38/Boiled_plantain_with_Vegetable_soup.jpg',
  'plantains-frits-epices': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Un_plat_d%27alloco_Fried_Plantains.JPG',
  'foufou-mais': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Fufu_Balls.jpg/960px-Fufu_Balls.jpg',
  'foufou-manioc': 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Pounded_cassava.jpg',
  'tape-plantain': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Puff_Balls_also_known_Beignets.jpg/960px-Puff_Balls_also_known_Beignets.jpg',
  'boulettes-viande': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Plato_de_Alb%C3%B3ndigas.jpg/960px-Plato_de_Alb%C3%B3ndigas.jpg',
  'boulettes-poisson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Fishball.jpg/960px-Fishball.jpg',
  'salade-fruits-exotiques': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Koh_Mak%2C_Thailand%2C_Tropical_breakfast%2C_Fruit_salad.jpg/960px-Koh_Mak%2C_Thailand%2C_Tropical_breakfast%2C_Fruit_salad.jpg',
  'banane-malaxee': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Cameroonian_Porridge_Plantain.jpg/960px-Cameroonian_Porridge_Plantain.jpg',
  'kossam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Lait_caill%C3%A9_01.jpg/960px-Lait_caill%C3%A9_01.jpg',
  'jus-ananas': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Batido_de_pi%C3%B1a.jpg/960px-Batido_de_pi%C3%B1a.jpg',

  // =================== BATCH 1 REMAINING ===================
  'salade-chou-rouge-blanc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/2015-12-20_Spitzkohlsalat_mit_M%C3%B6hren_anagoria.JPG/960px-2015-12-20_Spitzkohlsalat_mit_M%C3%B6hren_anagoria.JPG',
  'salade-laitue': 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=600',
  'salade-tomate': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Tomato_salad_with_onions_and_tuna.jpg/960px-Tomato_salad_with_onions_and_tuna.jpg',
  'salade-macedoine-simple': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Macedonia_salad.jpg/960px-Macedonia_salad.jpg',
  'macedoine-legumes-mayonnaise': 'https://images.pexels.com/photos/1332275/pexels-photo-1332275.jpeg?auto=compress&cs=tinysrgb&w=600',
  'avocat-ananas-concombre-penja': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Pineapple%2C_carrots%2C_avocado_on_mixed_greens_-_Massachusetts.jpg/960px-Pineapple%2C_carrots%2C_avocado_on_mixed_greens_-_Massachusetts.jpg',
  'spaghetti-sauce-avocat': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Spaghetti_aux_avocats.jpg/960px-Spaghetti_aux_avocats.jpg',
  'assok-bitetam': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/D%C3%A9gustation_de_koki.jpg/960px-D%C3%A9gustation_de_koki.jpg',
  'choux-farcis': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/02022_Hungarian_stuffed_cabbage_rolls_in_pickled_cabbage_leaves_with_veal_and_deer_meat.jpg/960px-02022_Hungarian_stuffed_cabbage_rolls_in_pickled_cabbage_leaves_with_veal_and_deer_meat.jpg',
  'choux-sautes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Sauteed_cabbage.jpg/960px-Sauteed_cabbage.jpg',
  'corn-tchap': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Red_Red_%28Ghanaian_bean_stew%29.jpg/960px-Red_Red_%28Ghanaian_bean_stew%29.jpg',
  'disingui': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Foufou_et_sauce_Aubergine.jpeg',
  'ebandjea': 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Poisson_brais%C3%A9_%C3%A0_la_fa%C3%A7on_du_Cameroun%2C_Kribi.JPG',
  'escargots-sautes': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Escargot_brais%C3%A9_02.jpg/960px-Escargot_brais%C3%A9_02.jpg',
  'folere-en-sauce': 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Bissap_jus_00.jpg',
  'folong-saute': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Callaloo.jpg/960px-Callaloo.jpg',
  'foss': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Eru_Soup.jpg',
  'haricots-en-sauce': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Red_Red_%28Ghanaian_bean_stew%29.jpg/960px-Red_Red_%28Ghanaian_bean_stew%29.jpg',
  'kelen-kelen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Callaloo.jpg/960px-Callaloo.jpg',
  'kouakoukou-sauce-blanche': 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Fufu_accompagn%C3%A9_d%27une_sauce_arachide_au_poulet.JPG',
  'kpem-sale': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a6/Ikok_sal%C3%A9_avec_manioc.jpg/960px-Ikok_sal%C3%A9_avec_manioc.jpg',
  'kpem-sans-sel': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Okok_and_kassava.jpg/960px-Okok_and_kassava.jpg',
  'kwa-ni-ndong': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Eru_Soup.jpg',
  'kwaa-ndzap': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/D%C3%A9gustation_de_koki.jpg/960px-D%C3%A9gustation_de_koki.jpg',
  'kwanmkwala-esubag': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Ekwang.jpg',
  'mbol': 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Eru_Soup.jpg',
  'met-de-pistache': 'https://upload.wikimedia.org/wikipedia/commons/5/50/Big_lot_of_Egusi_soup.jpg',
  'minkong': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/D%C3%A9gustation_de_koki.jpg/960px-D%C3%A9gustation_de_koki.jpg',
  'missounga': 'https://upload.wikimedia.org/wikipedia/commons/b/bc/Couscous_Senegalese_thi%C3%A8r%C3%A9_with_chicken_and_sauce.jpg',
  'nfiang-ndoo': 'https://upload.wikimedia.org/wikipedia/commons/9/91/Ndol%C3%A8_%C3%A0_la_viande%2C_morue_et_crevettes.jpg',

  // =================== BOISSONS ===================
  'jus-de-folere': 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Bissap_jus_00.jpg',
  'folere': 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Bissap_jus_00.jpg',
  'jus-folere': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Sobolo.jpg/960px-Sobolo.jpg',
  'jus-gingembre': 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Jus_de_gingembre-2025.jpg',
  'jus-de-gingembre': 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Jus_de_gingembre-2025.jpg',
};

// Fallback images by category (Wikimedia when possible, Pexels otherwise)
export const categoryFallbacks: Record<Category, string> = {
  'Plat': 'https://upload.wikimedia.org/wikipedia/commons/3/30/Poulet_DG.JPG',
  'Sauce': 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Mbongo_Tchobi_%28sauce_noir%29.jpg',
  'Grillade': 'https://upload.wikimedia.org/wikipedia/commons/c/c0/Poisson_brais%C3%A9_%C3%A0_la_fa%C3%A7on_du_Cameroun%2C_Kribi.JPG',
  'Entrée': 'https://upload.wikimedia.org/wikipedia/commons/a/a2/Salade_avocat_01.jpg',
  'Accompagnement': 'https://upload.wikimedia.org/wikipedia/commons/0/04/Un_plat_d%27alloco_Fried_Plantains.JPG',
  'Boisson': 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Bissap_jus_00.jpg',
  'Dessert': 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Nigerian-puff-puff-recipe_cropped.jpg',
};

/**
 * Get the image URL for a recipe by its id and category.
 * Returns a specific image if available, otherwise a category fallback.
 */
export function getRecipeImage(id: string, category: Category): string {
  return recipeImages[id] ?? categoryFallbacks[category];
}
