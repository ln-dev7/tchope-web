export const batch3: Record<string, { description?: string; ingredients?: { name: string; quantity: string }[]; steps?: string[]; tips?: string | null }> = {
  // Recipe 51: Nnam Olis
  'nnam-olis': {
    description: 'A traditional Béti dish of rice and peanuts steamed together in banana leaves.',
    ingredients: [
      { name: 'Roasted peanut paste', quantity: '200 g' },
      { name: 'Madjanga (crayfish)', quantity: '1 bowl' },
      { name: 'Rice', quantity: '200 g' },
      { name: 'Salt and chili pepper', quantity: 'To taste' },
      { name: 'Banana leaves and string', quantity: 'As needed' },
    ],
    steps: [
      'Roast the peanuts and crush them to obtain a fine paste.',
      'Cook the rice in salted water.',
      'Boil water, add the crayfish and peanut paste. Stir vigorously.',
      'Add salt and chili pepper. Add the cooked rice and mix.',
      'Form a ball in the banana leaves. Tie with string and steam for 30 minutes.',
    ],
    tips: null,
  },

  // Recipe 52: Nnam Wondo
  'nnam-wondo': {
    description: 'A traditional Béti peanut cake wrapped in banana leaves and steamed, served with cassava sticks or plantain.',
    ingredients: [
      { name: 'Warm water', quantity: '300 ml' },
      { name: 'Salt and chili pepper', quantity: 'To taste' },
      { name: 'Roasted peanut paste', quantity: '200 g' },
      { name: 'Crayfish or smoked fish or smoked meat', quantity: '200 g' },
      { name: 'Banana leaves and string', quantity: 'As needed' },
    ],
    steps: [
      'Roast the peanuts and crush them to obtain a fine paste.',
      'Pour water into the pot. Add the chosen protein and peanut paste into the boiling water.',
      'Stir vigorously. Gradually add water.',
      'Add salt and chili pepper, form a ball in the banana leaves.',
      'Tie with string and cook for 30 minutes over low heat.',
      'Serve with cassava sticks or plantain.',
    ],
    tips: null,
  },

  // Recipe 53: Ndomba de Bar
  'ndomba': {
    description: 'A Béti-style fish papillote where sea bass fillets are wrapped in banana leaves with a fragrant paste of shallots, tomatoes, ginger, and basil.',
    ingredients: [
      { name: 'Sea bass fillets', quantity: '4' },
      { name: 'Shallot', quantity: '1' },
      { name: 'Medium tomato', quantity: '1' },
      { name: 'Lime', quantity: '1' },
      { name: 'Ginger', quantity: '1 piece' },
      { name: 'Messep leaves (basil)', quantity: 'A few leaves' },
      { name: 'Salt and pepper', quantity: 'To taste' },
    ],
    steps: [
      'Prepare the banana leaves by warming them.',
      'Fillet your sea bass.',
      'Crush the shallot, tomato, basil, and ginger. Zest the lime and squeeze its juice.',
      'Spread the paste on the fillets, add salt and pepper, close the papillotes.',
      'Cook for 20 minutes. Serve immediately with sweet potato purée.',
    ],
    tips: null,
  },

  // Recipe 54: Ndomba de Porc
  'ndomba-porc': {
    description: 'Fried pork pieces wrapped in banana leaves with odzom, tomatoes, ginger, and lemon, then steamed to perfection.',
    ingredients: [
      { name: 'Pork shank', quantity: '1' },
      { name: 'Tomato', quantity: '1' },
      { name: 'Onion', quantity: '1' },
      { name: 'Lemon', quantity: '1' },
      { name: 'Messep and Odzom leaves', quantity: '4-5 of each' },
      { name: 'Ginger', quantity: '1 small piece' },
      { name: 'Salt, chili pepper', quantity: 'To taste' },
      { name: 'Peanut oil', quantity: 'For frying' },
    ],
    steps: [
      'Cut the meat into pieces, add salt and fry for 3-4 minutes. Drain.',
      'Lay out the banana leaves, line the bottom with odzom, place the pork pieces.',
      'Drizzle with lemon juice, add finely chopped tomato and onion, chopped ginger.',
      'Add salt, chili pepper and close the papillote.',
      'Place on a grill above water. Cook for 35 minutes over medium heat.',
      'Serve with rice, fried plantain or another side dish.',
    ],
    tips: null,
  },

  // Recipe 55: Ndomba de Vipère
  'ndomba-vipere': {
    description: 'An exotic papillote of viper meat marinated with local herbs and spices, wrapped in banana leaves and slowly steamed then grilled.',
    ingredients: [
      { name: 'Fresh viper meat', quantity: '1' },
      { name: 'Odzom, Messep, Hisim leaves', quantity: 'To taste' },
      { name: 'Vinegar or lemon', quantity: 'For cleaning' },
      { name: 'Tomato', quantity: '1' },
      { name: 'Onion and garlic', quantity: '1 of each' },
      { name: 'White pepper', quantity: 'To taste' },
      { name: 'Seasoning cubes', quantity: '2' },
      { name: 'Salt, chili pepper', quantity: 'To taste' },
      { name: 'Banana leaves', quantity: 'As needed' },
    ],
    steps: [
      'Carefully clean the viper. Cut into pieces and wash with vinegar or lemon.',
      'Finely chop the green herbs, tomato and onion. Crush the chili pepper, garlic and white pepper.',
      'Coat the viper with the herbs, let marinate for 15 minutes.',
      'Spread out the banana leaves, lay the odzom leaves, then the marinated viper. Tie the bundle.',
      'Steam in a pot for 1 hour.',
      'Place on barbecue coals for 30 minutes to dry.',
    ],
    tips: null,
  },

  // Recipe 56: Ndolé aux Crevettes
  'ndole': {
    description: 'The national dish of Cameroon - bitter leaves cooked with peanut paste, shrimp, and meat in a rich, complex sauce that defines Cameroonian cuisine.',
    ingredients: [
      { name: 'Ndolé leaves', quantity: '2 kg' },
      { name: 'Meat or smoked fish', quantity: '1 kg' },
      { name: 'Oil', quantity: '0.5 litre' },
      { name: 'Peanut paste', quantity: '300 g' },
      { name: 'Dried shrimp', quantity: '150 g' },
      { name: 'Onions', quantity: '150 g' },
      { name: 'Rock salt or halite', quantity: '20 g' },
      { name: 'Garlic cloves', quantity: '3' },
      { name: 'Red chili pepper', quantity: '1' },
      { name: 'Water', quantity: '1 litre' },
      { name: 'Salt', quantity: 'To taste' },
    ],
    steps: [
      'Cook the meat in salted water for about 1 hour.',
      'Boil the ndolé leaves in water with rock salt for 30 minutes.',
      'Wash the leaves several times and drain by pressing.',
      'Finely crush the soaked peanuts.',
      'Finely chop the leaves. Mix the spices (tomato, garlic, onion, chili pepper, basil).',
      'Heat the oil, add the spices, stir, add water and peanuts.',
      'Add the meat or fish and shrimp. Cook covered for 30 minutes.',
      'Add the ndolé leaves. Mix and cook covered for 20 minutes.',
      'Before serving, fry sliced onion and pour over the ndolé.',
    ],
    tips: 'Check the bitterness of the leaves before the final cooking. Several washes are necessary.',
  },

  // Recipe 57: Nsugi au Gibier
  'nsugi': {
    description: 'A Bassa palm nut sauce with game meat and peanuts, slow-cooked to a beautiful orange hue, served with grated cocoyam.',
    ingredients: [
      { name: 'Fresh or smoked game meat', quantity: '1' },
      { name: 'Palm nut juice', quantity: '800 g' },
      { name: 'Large onions', quantity: '3' },
      { name: 'Garlic clove', quantity: '1' },
      { name: 'Peanuts', quantity: '100 g' },
      { name: 'Shrimp powder', quantity: '1 tablespoon' },
      { name: 'Fresh chili pepper', quantity: 'To taste' },
      { name: 'Thyme and bay leaf', quantity: '1 sprig and 2 leaves' },
      { name: 'Seasoning cube', quantity: '1' },
      { name: 'Salt', quantity: 'To taste' },
    ],
    steps: [
      'Prepare and cook the game meat in salted water for 1h30.',
      'Boil the palm nuts, pound and extract the juice. Strain through a sieve.',
      'Pour the sauce into a large pot, add onions, garlic, thyme and bay leaf.',
      'Add to the meat. Add the crushed peanuts.',
      'Let reduce for about 1 hour while stirring. Serve with grated cocoyam.',
    ],
    tips: null,
  },

  // Recipe 58: Okok Salé
  'okok-sale': {
    description: 'A rich Bassa-origin dish of shredded okok leaves cooked with peanuts, palm oil, smoked fish, and beef - a centerpiece of Cameroonian gastronomy.',
    ingredients: [
      { name: 'Pre-cut Ikok leaves', quantity: '20 bundles' },
      { name: 'Palm oil', quantity: '1/2 litre' },
      { name: 'Peanuts', quantity: '5 cups' },
      { name: 'Smoked cod', quantity: '2 bundles' },
      { name: 'Beef', quantity: '1/2 kg' },
      { name: 'Chili pepper', quantity: '2 fruits' },
      { name: 'Garlic clove and ginger', quantity: '1 of each' },
      { name: 'Salt', quantity: 'To taste' },
      { name: 'Onion and celery', quantity: '1 + 1-2 stalks' },
      { name: 'Maggi shrimp cubes', quantity: '2' },
    ],
    steps: [
      'Wash the leaves thoroughly and drain them.',
      'Cut and cook the meat with onion and celery.',
      'Clean the smoked fish. Crush ginger and garlic. Roast and crush the peanuts.',
      'Add fish, garlic, ginger, chili peppers and Maggi cube to the meat.',
      'Add water and bring to a boil. Gradually add the peanuts and ikok leaves.',
      'Gradually add the palm oil. Let simmer over low heat.',
      'When the oil rises to the surface, stir and turn off the heat.',
    ],
    tips: null,
  },

  // Recipe 59: Okok Sucré
  'okok-sucre': {
    description: 'The sweet version of okok from the Béti people, combining okok leaves with palm nut juice, peanuts, and a touch of sugar.',
    ingredients: [
      { name: 'Chopped okok', quantity: 'As needed' },
      { name: 'Palm nuts', quantity: 'As needed' },
      { name: 'Peanuts', quantity: 'As needed' },
      { name: 'Salt', quantity: 'To taste' },
      { name: 'Sugar', quantity: 'Optional' },
      { name: 'Crayfish', quantity: 'Optional' },
    ],
    steps: [
      'Boil the palm nuts and okok leaves together for 25-30 minutes.',
      'Roast the peanuts and crush them into a smooth paste.',
      'Pound the cooked nuts to extract the pulp.',
      'Simmer the palm nut pulp and peanut paste mixture for 10-15 minutes.',
      'Gradually add the okok. Let simmer for 10-15 minutes.',
      'Add sugar. Serve hot with cassava sticks.',
    ],
    tips: null,
  },

  // Recipe 60: Pâte d'Arachides
  'pate-arachides': {
    description: 'A rich and creamy peanut sauce with crayfish, a versatile accompaniment for many Cameroonian staples.',
    ingredients: [
      { name: 'Peanuts', quantity: '500 g' },
      { name: 'Water', quantity: '1/4 litre' },
      { name: 'Crayfish', quantity: '200 g' },
      { name: 'Salt', quantity: 'To taste' },
    ],
    steps: [
      'Roast the peanuts with their skin until done.',
      'Bring the water to a boil, add the crayfish. Let boil for 5 minutes.',
      'Add salt and the peanut paste while stirring.',
      'Cook over low heat, stirring frequently until the oil appears.',
    ],
    tips: null,
  },

  // Recipe 61: Pattes de Bœuf en Bouillon
  'pattes-boeuf-bouillon': {
    description: 'A deeply flavorful beef trotter soup slow-cooked for hours with djansang, ginger, and vegetables.',
    ingredients: [
      { name: 'Cleaned beef trotters', quantity: '2' },
      { name: 'Garlic clove', quantity: '1' },
      { name: 'Ginger', quantity: 'To taste' },
      { name: 'Salt, white pepper', quantity: 'To taste' },
      { name: 'Djansang', quantity: '1/2 glass' },
      { name: 'Chili pepper', quantity: 'To taste' },
      { name: 'Carrots, bell pepper, tomatoes', quantity: 'To taste' },
    ],
    steps: [
      'Boil the beef trotters with garlic, ginger and pepper for 4 hours.',
      'Add the crushed djansang, vegetables and whole chili pepper.',
      'Let simmer for about ten minutes.',
      'Serve hot with boiled plantain or yam.',
    ],
    tips: null,
  },

  // Recipe 62: Pattes de Porc en Bouillon
  'pattes-porc-bouillon': {
    description: 'A rich pig trotter stew with potatoes, peppers, and aromatic herbs - a complete meal in itself.',
    ingredients: [
      { name: 'Pig trotters', quantity: '2 kg' },
      { name: 'Potatoes', quantity: '1.5 kg' },
      { name: 'Oil', quantity: '15 cl' },
      { name: 'Ripe tomatoes', quantity: '7' },
      { name: 'Large onions', quantity: '2' },
      { name: 'Celery and chives', quantity: '4 stalks each' },
      { name: 'Bay leaves', quantity: '3' },
      { name: 'Garlic, nutmeg', quantity: '1 clove, 1 nut' },
      { name: 'Large green bell peppers', quantity: '2' },
      { name: 'Red chili peppers', quantity: '10' },
      { name: 'Salt and white pepper', quantity: 'To taste' },
    ],
    steps: [
      'Soak the pig trotters for 5 minutes in hot salted water.',
      'Prepare the spices. Pour into the pot with plenty of water.',
      'Add salt, bay leaves, meat broth and pepper. Let boil for 1h30.',
      'Add oil, chili peppers and potatoes. Let boil for another 30 minutes.',
    ],
    tips: null,
  },

  // Recipe 63: Peau de Bœuf Sauce Tomate
  'peau-boeuf-sauce-tomate': {
    description: 'Cow skin simmered in a savory tomato sauce with peppers, leeks, and celery - an economical Cameroonian classic.',
    ingredients: [
      { name: 'Cow skin', quantity: '0.5 kg' },
      { name: 'Onions', quantity: '3' },
      { name: 'Garlic clove', quantity: '1' },
      { name: 'Parsley', quantity: '1/2 bunch' },
      { name: 'Tomatoes', quantity: '6' },
      { name: 'Bell pepper, leek, celery', quantity: '1 of each' },
      { name: 'Chili pepper', quantity: 'To taste' },
      { name: 'Vegetable oil', quantity: 'As needed' },
      { name: 'Salt and pepper', quantity: 'To taste' },
    ],
    steps: [
      'Cut and wash the cow skin, boil it for 20-30 minutes.',
      'Sweat the chopped onions in oil over low heat.',
      'Add garlic, diced tomatoes, bell pepper, leek, parsley, salt, pepper and chili.',
      'Let simmer for 15-20 minutes. Lower the heat to reduce the sauce.',
      'Add the cooked cow skin and let simmer for 5-10 minutes.',
    ],
    tips: null,
  },

  // Recipe 64: Pepper Soup
  'pepper-soup': {
    description: 'A fiery and aromatic Cameroonian soup with fish, a signature blend of mbongo, djansang, pèbè, and fresh basil.',
    ingredients: [
      { name: 'Fish', quantity: '1 kg' },
      { name: 'Garlic cloves', quantity: '2' },
      { name: 'Ginger', quantity: '1 piece' },
      { name: 'Djansang', quantity: '20 g' },
      { name: 'Mbongo', quantity: '2 pods' },
      { name: 'Pèbè', quantity: '10 g' },
      { name: 'Basil', quantity: '1 sprig' },
      { name: 'Tomatoes', quantity: '3' },
      { name: 'Onion', quantity: '1' },
      { name: 'Peanut oil', quantity: '2 tablespoons' },
      { name: 'Chili peppers', quantity: '2' },
    ],
    steps: [
      'Scale, gut and cut the fish into steaks. Add salt and set aside.',
      'Finely crush the spices and tomatoes.',
      'Place the fish at the bottom, pour the mixture and oil. Add water.',
      'Cook for 20 minutes over low heat. Adjust seasoning.',
      'Serve hot with rice.',
    ],
    tips: null,
  },

  // Recipe 65: Pilé de Plantains
  'pile-plantains': {
    description: 'A hearty Bamiléké dish of ripe plantains and beans pounded together with red palm oil and hot pepper.',
    ingredients: [
      { name: 'Red or black beans', quantity: '500 g' },
      { name: 'Ripe plantains', quantity: '8 fingers' },
      { name: 'Water', quantity: '500 ml' },
      { name: 'Red palm oil', quantity: '250 ml' },
      { name: 'Salt and chili pepper', quantity: 'To taste' },
    ],
    steps: [
      'Soak the beans for 6 hours. Rinse and cook over medium heat.',
      'After 1 hour, add the washed unpeeled plantains. Cook for another hour.',
      'Drain the beans and peel the plantains. Pound the mixture.',
      'Heat the palm oil, pour over the mixture. Add salt, chili pepper, mix and serve.',
    ],
    tips: null,
  },

  // Recipe 66: Pilé de Pommes de Terre
  'pile-pommes-de-terre': {
    description: 'A Western Cameroon specialty of potatoes and beans pounded together with palm oil - simple, economical, and satisfying.',
    ingredients: [
      { name: 'Red or black beans', quantity: '700 g' },
      { name: 'Potatoes', quantity: '2 kg' },
      { name: 'Water', quantity: '500 ml' },
      { name: 'Red palm oil', quantity: '250 ml' },
      { name: 'Salt and chili pepper', quantity: 'To taste' },
    ],
    steps: [
      'Soak the beans for 6 hours. Rinse and cook.',
      'Peel the potatoes, wash and soak in salted water.',
      'Cook the potatoes. Add the palm oil and chili pepper.',
      'Add the cooked beans. Gently pound the mixture. Shape into a ball and serve.',
    ],
    tips: null,
  },

  // Recipe 67: Pili Pili
  'pili-pili': {
    description: 'Savory Cameroonian stuffed fritters with a spiced meat filling, green herb rof, and tangy homemade tomato sauce.',
    ingredients: [
      { name: 'Flour', quantity: '500 g' },
      { name: 'Yeast, butter, eggs', quantity: '1 packet, 50 g, 2' },
      { name: 'Ground meat', quantity: '300 g' },
      { name: 'Onion', quantity: '1' },
      { name: 'Parsley', quantity: '1 bunch' },
      { name: 'Tomatoes', quantity: '4' },
      { name: 'Chili pepper, garlic', quantity: 'To taste' },
      { name: 'Salt and pepper', quantity: 'To taste' },
    ],
    steps: [
      'Mix flour, yeast, butter and eggs. Knead with salted water. Let rest for 2 hours.',
      'Prepare the tomato sauce and the meat filling with the herb rof.',
      'Roll out the dough, cut into squares, place the filling and pinch the edges.',
      'Deep fry until golden. Serve with the tomato sauce.',
    ],
    tips: null,
  },

  // Recipe 68: Poisson Braisé
  'poisson-braise': {
    description: 'The quintessential Cameroonian grilled fish, marinated in a pungent paste of ginger, garlic, pèbè, and white pepper, charred to perfection.',
    ingredients: [
      { name: 'Fish (sea bass, sole or mackerel)', quantity: 'As needed' },
      { name: 'Ginger', quantity: '50 g' },
      { name: 'Garlic', quantity: '50 g' },
      { name: 'Pèbè', quantity: '4' },
      { name: 'White pepper', quantity: '10 g' },
      { name: 'Lemon juice', quantity: '1 tablespoon' },
      { name: 'Oil', quantity: 'As needed' },
    ],
    steps: [
      'Peel the garlic and ginger. Shell and roast the pèbè for 2-3 minutes.',
      'Finely crush into a smooth paste. Add lemon juice and oil.',
      'Scale, gut and trim the fish. Make cuts every 2-3 cm.',
      'Add salt and coat with marinade. Let rest for 20 minutes.',
      'Cook on a barbecue or under a grill.',
      'Serve with plantain fries or cassava sticks.',
    ],
    tips: null,
  },

  // Recipe 69: Porc Braisé
  'porc-braise': {
    description: 'Succulent pork grilled over charcoal, marinated with crushed onions, garlic, parsley, and basil, basted with spiced oil.',
    ingredients: [
      { name: 'Pork', quantity: 'As needed' },
      { name: 'Onions, garlic, parsley, basil', quantity: 'To taste' },
      { name: 'Chili pepper', quantity: 'To taste' },
      { name: 'Salt or seasoning cube', quantity: 'To taste' },
      { name: 'Peanut oil', quantity: 'As needed' },
    ],
    steps: [
      'Cut and wash the meat. Crush the seasonings.',
      'Marinate the meat with the seasonings.',
      'Prepare the oil, chili pepper and parsley mixture.',
      'Baste the meat during cooking on the coals.',
      'Serve with plantain fries, cassava sticks.',
    ],
    tips: null,
  },

  // Recipe 70: Poulet Braisé
  'poulet-braise': {
    description: 'Cameroonian barbecued chicken marinated in a rich paste of celery, basil, djansang, ginger, and citrus, grilled to golden perfection.',
    ingredients: [
      { name: 'Whole chicken', quantity: '1' },
      { name: 'Celery, basil, parsley, thyme', quantity: 'To taste' },
      { name: 'Djansang, pèbè', quantity: 'To taste' },
      { name: 'Onion, garlic, ginger, bell pepper', quantity: '1 of each' },
      { name: 'Oil, vinegar, lemon', quantity: 'As needed' },
      { name: 'Chili pepper, pepper, salt', quantity: 'To taste' },
      { name: 'Bouillon cube', quantity: '1' },
    ],
    steps: [
      'Clean the chicken and cut into pieces. Wash with vinegar and salt.',
      'Crush all the seasonings. Marinate the chicken for 2 hours in the fridge with lemon juice and oil.',
      'Oil the barbecue grill, light the coals.',
      'Grill the pieces, turning from time to time.',
      'Serve the chicken hot with a side dish of your choice.',
    ],
    tips: null,
  },

  // Recipe 71: Poulet DG
  'poulet-dg': {
    description: 'The legendary "Director General\'s Chicken" - a prestigious dish of golden chicken and fried ripe plantains in a vegetable sauce.',
    ingredients: [
      { name: 'Chicken', quantity: '1' },
      { name: 'Carrots', quantity: '2' },
      { name: 'Bell peppers', quantity: '2' },
      { name: 'Onions', quantity: '2' },
      { name: 'Tomatoes', quantity: '3' },
      { name: 'Green beans', quantity: '200 g' },
      { name: 'Ripe plantains', quantity: '12 fingers' },
      { name: 'Garlic cloves', quantity: '2' },
      { name: 'Ground ginger', quantity: 'To taste' },
      { name: 'Maggi cubes', quantity: '2' },
      { name: 'Chili pepper', quantity: '1' },
      { name: 'Peanut oil', quantity: 'As needed' },
      { name: 'Salt', quantity: 'To taste' },
    ],
    steps: [
      'Cut and prepare the chicken. Cook for 10 minutes with onion, bell pepper and garlic.',
      'Prepare carrots, diced tomatoes and diced green beans.',
      'Brown the chicken pieces in oil. Set aside.',
      'Slice and fry the plantains into rounds. Set aside.',
      'Sauté carrots, green beans, tomatoes and bell peppers.',
      'Season with cube, ginger, chili pepper and a glass of water.',
      'Gradually add the chicken and plantain. Cook for 10 minutes.',
    ],
    tips: null,
  },

  // Recipe 72: Poulet Rôti
  'poulet-roti': {
    description: 'A Cameroonian-style deep-fried whole chicken, first boiled with herbs and spices, then fried to a crispy golden finish.',
    ingredients: [
      { name: 'Whole chicken', quantity: '1' },
      { name: 'Onion, mustard, thyme, rosemary, parsley', quantity: 'To taste' },
      { name: 'Garlic', quantity: '3 cloves' },
      { name: 'Dried hot chili peppers', quantity: '2' },
      { name: 'Bouillon cube', quantity: '1' },
      { name: 'Black pepper and salt', quantity: 'To taste' },
      { name: 'Vegetable oil', quantity: '2 litres' },
    ],
    steps: [
      'Place the chicken in a pot with all the seasonings.',
      'Cover with water and bring to a boil. Cook completely.',
      'Heat the oil and deep-fry the whole chicken until golden.',
      'Remove and drain on paper towels.',
    ],
    tips: null,
  },

  // Recipe 73: Queue de Bœuf Sauce d'Arachides
  'queue-boeuf-sauce-arachides': {
    description: 'A luxurious oxtail stew simmered in a creamy peanut sauce with tomatoes and onions.',
    ingredients: [
      { name: 'Oxtail', quantity: '1.5 kg' },
      { name: 'Onions', quantity: '2' },
      { name: 'Tomatoes', quantity: '5' },
      { name: 'Bay leaf', quantity: '1' },
      { name: 'Peanut paste', quantity: '250 g' },
    ],
    steps: [
      'Cook the meat in salted water with chopped onions and bay leaf for 1 hour.',
      'Crush the tomatoes and the remaining onions.',
      'Brown the meat in a Dutch oven with oil.',
      'Add the crushed tomatoes and cook for 10 minutes.',
      'Mix the peanut paste with the cooking broth. Pour over the tomatoes.',
      'Cook for 20 minutes. Serve with rice.',
    ],
    tips: null,
  },

  // Recipe 74: Riz Jollof Façon Buea
  'riz-jollof': {
    description: 'A Cameroonian twist on the famous West African Jollof rice, enriched with coconut milk, mushrooms, and fresh vegetables.',
    ingredients: [
      { name: 'Chopped onion', quantity: '1' },
      { name: 'Peanut oil', quantity: '2 tablespoons' },
      { name: 'Peeled diced tomatoes', quantity: '4' },
      { name: 'Tomato purée', quantity: '1 teaspoon' },
      { name: 'Coconut milk', quantity: '300 ml' },
      { name: 'Diced carrots', quantity: '2' },
      { name: 'Chili pepper, salt, ginger', quantity: 'To taste' },
      { name: 'Bay leaf', quantity: '1' },
      { name: 'Long grain rice', quantity: '300 g' },
      { name: 'Button mushrooms', quantity: '100 g' },
      { name: 'Green bell pepper', quantity: '1 small' },
    ],
    steps: [
      'Sauté the onion in hot oil.',
      'Add the tomatoes and tomato paste, cook for 6 minutes.',
      'Stir in 60 ml of coconut milk and continue cooking.',
      'Add the remaining coconut milk, vegetables and spices.',
      'Bring to a boil, add the rice. Lower the heat and cover.',
      'Cook until the liquid is absorbed.',
    ],
    tips: null,
  },

  // Recipe 75: Rôti de Mouton
  'roti-mouton': {
    description: 'A slow-roasted leg of lamb marinated with mustard, ginger, garlic, and onions - a festive dish for celebrations.',
    ingredients: [
      { name: 'Leg of lamb', quantity: '1' },
      { name: 'Large onions', quantity: '2' },
      { name: 'Ginger', quantity: '1 large' },
      { name: 'Garlic cloves', quantity: '3' },
      { name: 'Mustard', quantity: '2 tablespoons' },
      { name: 'Oil, salt, pepper, bell pepper', quantity: 'As needed' },
    ],
    steps: [
      'Prepare the marinade with onions, garlic, ginger, bell pepper, mustard, salt and pepper.',
      'Pour over the meat and let rest.',
      'Place a large pot over very low heat. Place the marinated leg inside.',
      'Let simmer for 2 hours, turning every 30 minutes.',
      'After cooking, let rest for 30 minutes.',
    ],
    tips: 'The heat must be very low so the meat can cook thoroughly from the inside.',
  },
};
