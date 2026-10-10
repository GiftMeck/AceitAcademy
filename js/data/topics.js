/**
 * Notes and diagnostic questions for each topic.
 *
 * How a topic works:
 *  - sections: the short notes students read first
 *  - skills:   the smaller ideas inside the topic. Each has a short "fix" explanation
 *              and a worked example ("eg") shown when a student has a gap in it
 *  - questions: each belongs to one skill. Every wrong option has a "why" that names
 *              the mistake. The first two questions for each skill are the diagnostic
 *              set; the third is kept back for "Test again".
 */
export const TOPICS = {
  'simultaneous-equations': {
    subject: 'mathematics', minutes: 12,
    intro: 'Two equations, two unknowns. The answer is the one pair of values that makes both equations true at the same time.',
    sections: [
      { h: 'The big idea', b: '<p>Each equation on its own has endless solutions. Together, only one pair (x, y) works for both. On a graph, it is the point where the two lines cross.</p>' },
      { h: 'Elimination', b: '<p>Make the number in front of one letter the same in both equations, then add or subtract so that letter disappears.</p><p><strong>Same signs, subtract. Different signs, add.</strong></p><div class="eg"><p>2x + y = 11 and x − y = 1</p><p>The y terms have different signs, so add: 3x = 12, so x = 4.</p><p>Put x = 4 into x − y = 1: y = 3.</p></div><p>If the numbers do not match, multiply a whole equation first. Every term gets multiplied, including the answer on the right.</p>' },
      { h: 'Substitution', b: '<p>Rearrange one equation to make one letter the subject, then put that expression into the other equation.</p><div class="eg"><p>y = 2x − 1 and 3x + y = 9</p><p>Replace y: 3x + 2x − 1 = 9, so 5x = 10 and x = 2.</p><p>Then y = 2(2) − 1 = 3.</p></div>' },
      { h: 'Forming equations from words', b: '<p>Give each unknown a letter, then write one equation for each fact you are told.</p><div class="eg"><p>2 pens and 1 notebook cost MK1,300. 1 pen and 1 notebook cost MK900.</p><p>2p + n = 1300 and p + n = 900. Subtract: p = 400, so n = 500.</p></div>' },
      { h: 'Always finish and check', b: '<p>Find both values, then put them back into <em>both</em> original equations. If either one fails, something went wrong.</p>' },
      { h: 'Common mistakes', b: '<ul><li>Adding when the signs are the same (or subtracting when they differ).</li><li>Multiplying only one term of an equation instead of all of them.</li><li>Stopping after finding x and forgetting y.</li></ul>' },
    ],
    skills: {
      elim: { name: 'Elimination', fix: '<p>Line the equations up and look only at the letter you want to remove.</p><p>If its terms have the <strong>same sign</strong> (both + or both −), subtract the equations. If the signs are <strong>different</strong>, add them.</p><p>If the numbers in front do not match, multiply the whole equation, every term, until they do.</p>', eg: '<p>3x + 2y = 16 and x + 2y = 8</p><p>Both y terms are +2y, same sign, so subtract: 2x = 8, x = 4.</p><p>Then 4 + 2y = 8, so y = 2.</p>' },
      subst: { name: 'Substitution', fix: '<p>Make one letter the subject of one equation. When you move a term across the equals sign, its sign flips.</p><p>Then replace that letter in the other equation with the whole expression, in brackets if needed.</p>', eg: '<p>x − 2y = 1 becomes x = 1 + 2y.</p><p>Into 3x + y = 10: 3(1 + 2y) + y = 10, so 3 + 7y = 10 and y = 1. Then x = 3.</p>' },
      form: { name: 'Forming equations', fix: '<p>Write down what each letter stands for before you start. Then turn each sentence into one equation, matching the numbers to the right letters.</p><p>"Sum" means add, "difference" means subtract, and "2 pens" means 2 × p.</p>', eg: '<p>Adult tickets cost MK1,000 and child tickets MK500. 9 tickets cost MK6,000.</p><p>a + c = 9 and 1000a + 500c = 6000.</p>' },
      check: { name: 'Finishing and checking', fix: '<p>Finding one letter is halfway. Put it back into an original equation to find the other, then test both values in both equations.</p><p>Watch the signs: if −y = −3, then y = 3.</p>', eg: '<p>2x + y = 11 and x − y = 1, with x = 4.</p><p>4 − y = 1, so −y = −3 and y = 3.</p><p>Check: 2(4) + 3 = 11 ✓ and 4 − 3 = 1 ✓</p>' },
    },
    questions: [
      { id: 'se1', skill: 'elim', q: 'Solve x + y = 10 and x − y = 4.', options: [
        { t: 'x = 7, y = 3', ok: true },
        { t: 'x = 14, y = −4', why: 'Adding gives 2x = 14. You still need to divide by 2.' },
        { t: 'x = 3, y = 7', why: 'The values are swapped. Put them back into x − y = 4 to see it fails.' } ],
        explain: 'Add the equations to remove y: 2x = 14, so x = 7. Then 7 + y = 10, so y = 3.' },
      { id: 'se2', skill: 'elim', q: '3x + 2y = 16 and x + 2y = 8. What should you do first to remove y?', options: [
        { t: 'Subtract the equations', ok: true },
        { t: 'Add the equations', why: 'Both y terms are +2y. Same signs means subtract, not add.' },
        { t: 'Multiply the second equation by 3, then add', why: 'That would target x, and adding still would not remove it.' } ],
        explain: 'Both equations contain +2y. Same signs, so subtract: 2x = 8, giving x = 4 and y = 2.' },
      { id: 'se3', skill: 'elim', q: '2x + 3y = 12 and 4x − y = 10. How do you remove x?', options: [
        { t: 'Multiply the first equation by 2, then subtract', ok: true },
        { t: 'Multiply the first equation by 2, then add', why: 'After multiplying, both x terms are +4x. Same signs means subtract.' },
        { t: 'Multiply only the 2x term by 2, then subtract', why: 'Every term in the equation must be multiplied, including the 3y and the 12.' } ],
        explain: '2 × (2x + 3y = 12) gives 4x + 6y = 24. Subtract 4x − y = 10: 7y = 14, so y = 2 and x = 3.' },

      { id: 'se4', skill: 'subst', q: 'Solve y = x + 3 and 2x + y = 12.', options: [
        { t: 'x = 3, y = 6', ok: true },
        { t: 'x = 5, y = 8', why: 'Moving +3 across the equals sign makes it −3, so 3x = 9, not 15.' },
        { t: 'x = 3, y = 3', why: 'x is right, but y = x + 3, so y = 6.' } ],
        explain: 'Substitute: 2x + (x + 3) = 12, so 3x = 9 and x = 3. Then y = 3 + 3 = 6.' },
      { id: 'se5', skill: 'subst', q: 'Rearrange x − 2y = 1 to make x the subject.', options: [
        { t: 'x = 1 + 2y', ok: true },
        { t: 'x = 1 − 2y', why: 'When −2y moves across the equals sign it becomes +2y.' },
        { t: 'x = 2y − 1', why: 'The 1 stays positive. Only the 2y term moves.' } ],
        explain: 'Add 2y to both sides: x = 1 + 2y.' },
      { id: 'se6', skill: 'subst', q: 'Solve y = 2x and x + y = 9.', options: [
        { t: 'x = 3, y = 6', ok: true },
        { t: 'x = 4.5, y = 4.5', why: 'That assumes x and y are equal, but y is twice x.' },
        { t: 'x = 9, y = 18', why: 'x + 2x is 3x, so 3x = 9.' } ],
        explain: 'Substitute y = 2x: x + 2x = 9, so 3x = 9, x = 3 and y = 6.' },

      { id: 'se7', skill: 'form', q: 'A pen costs p kwacha and a notebook costs n kwacha. 2 pens and 1 notebook cost MK1,300. Which equation fits?', options: [
        { t: '2p + n = 1300', ok: true },
        { t: 'p + 2n = 1300', why: 'There are 2 pens, so the 2 belongs with p.' },
        { t: '2pn = 1300', why: 'Different items are added together, not multiplied.' } ],
        explain: '2 pens cost 2p and 1 notebook costs n. Together: 2p + n = 1300.' },
      { id: 'se8', skill: 'form', q: 'The sum of two numbers is 20 and their difference is 6. Which pair of equations fits?', options: [
        { t: 'x + y = 20 and x − y = 6', ok: true },
        { t: 'x + y = 6 and x − y = 20', why: 'The sum is 20 and the difference is 6. Match each number to its word.' },
        { t: 'xy = 20 and x − y = 6', why: '"Sum" means add, not multiply.' } ],
        explain: 'Sum means add (x + y = 20). Difference means subtract (x − y = 6). The numbers are 13 and 7.' },
      { id: 'se9', skill: 'form', q: 'Adult tickets cost MK1,000 and child tickets MK500. 9 tickets cost MK6,000 in total. How many adult tickets were bought?', options: [
        { t: '3', ok: true },
        { t: '6', why: 'That is the number of child tickets. Check which letter you solved for.' },
        { t: '12', why: '6000 ÷ 500 ignores that some tickets cost MK1,000.' } ],
        explain: 'a + c = 9 and 1000a + 500c = 6000. Substitute c = 9 − a: 500a + 4500 = 6000, so a = 3 and c = 6.' },

      { id: 'se10', skill: 'check', q: 'For 2x + y = 11 and x − y = 1, you found x = 4. What is y?', options: [
        { t: 'y = 3', ok: true },
        { t: 'y = −3', why: 'From 4 − y = 1, −y = −3, and dividing by −1 gives y = 3.' },
        { t: 'y = 7', why: 'In 2x + y = 11, 2x is 8, not 4.' } ],
        explain: '4 − y = 1, so y = 3. Check: 2(4) + 3 = 11 ✓' },
      { id: 'se11', skill: 'check', q: 'Is x = 2, y = 5 a solution of x + y = 7 and 3x − y = 2?', options: [
        { t: 'No, it fails the second equation', ok: true },
        { t: 'Yes, it works in the first equation', why: 'A solution must work in both equations, not just one.' },
        { t: 'Yes, both equations are true', why: '3(2) − 5 = 1, not 2.' } ],
        explain: '2 + 5 = 7 ✓ but 3(2) − 5 = 1 ✗. It is not a solution.' },
      { id: 'se12', skill: 'check', q: 'You found x = 5 from x + y = 12 and another equation. What next?', options: [
        { t: 'Put x = 5 into an original equation to find y, then check both', ok: true },
        { t: 'Stop, the answer is x = 5', why: 'Simultaneous equations need both values.' },
        { t: 'Pick a y that makes the numbers look neat', why: 'y has to come from the equations, not a guess.' } ],
        explain: 'x + y = 12 gives y = 7. Then test x = 5, y = 7 in both equations.' },
    ],
  },

  'osmosis': {
    subject: 'biology', minutes: 10,
    intro: 'Osmosis is how water moves in and out of cells. It explains why plants wilt, why salt preserves fish and why cells can burst.',
    sections: [
      { h: 'The big idea', b: '<p>Osmosis is the net movement of <strong>water</strong> molecules from a dilute solution to a more concentrated solution, through a <strong>partially permeable membrane</strong>.</p><p>A dilute solution has lots of water and little solute. A concentrated solution has less water.</p>' },
      { h: 'Plant cells', b: '<p>In pure water or a dilute solution, water enters the cell and it becomes <strong>turgid</strong>. The cell wall stops it bursting.</p><p>In a concentrated solution, water leaves. The cell becomes <strong>flaccid</strong>, and eventually the membrane pulls away from the wall. This is <strong>plasmolysis</strong>.</p>' },
      { h: 'Animal cells', b: '<p>Animal cells have no cell wall. Red blood cells in pure water take in water and <strong>burst</strong>. In a concentrated solution they lose water and <strong>shrink</strong>.</p>' },
      { h: 'The potato experiment', b: '<p>Put potato strips in sugar solutions of different concentrations and measure the change in mass.</p><ul><li>Dilute solutions: strips gain mass (water moves in).</li><li>Concentrated solutions: strips lose mass (water moves out).</li><li>No change: the solution matches the potato cells.</li></ul><div class="eg"><p>Percentage change = change in mass ÷ starting mass × 100</p><p>2.0 g to 2.5 g: 0.5 ÷ 2.0 × 100 = +25%</p></div>' },
      { h: 'Close to home', b: '<p>Salting usipa before drying draws water out of the fish by osmosis, which helps stop it going bad. Too much fertiliser around roots can do the same to a plant, pulling water out of root cells.</p>' },
      { h: 'Common mistakes', b: '<ul><li>Saying the <em>solute</em> moves. In osmosis, it is the water.</li><li>Getting the direction backwards. Water moves towards the more concentrated solution.</li><li>Saying plant cells burst. The cell wall prevents it.</li></ul>' },
    ],
    skills: {
      def: { name: 'What osmosis is', fix: '<p>Keep three things in every definition: <strong>water</strong> moves, from <strong>dilute to concentrated</strong>, through a <strong>partially permeable membrane</strong>.</p><p>Think of water moving to "dilute" the stronger solution.</p>', eg: '<p>A is 5% sugar, B is 20% sugar.</p><p>B is more concentrated, so water moves from A into B.</p>' },
      cells: { name: 'Effects on cells', fix: '<p>Ask two questions: is water moving in or out, and does the cell have a wall?</p><p>Plant cells: in means turgid, out means flaccid then plasmolysed. Animal cells: in means they can burst, out means they shrink.</p>', eg: '<p>Red blood cells in very salty water lose water and shrink. In pure water they swell and burst, because there is no wall.</p>' },
      exp: { name: 'Experiments and results', fix: '<p>Mass goes up when water moves in and down when water moves out. Always use percentage change so strips of different sizes can be compared.</p><p>Divide the change by the <strong>starting</strong> mass.</p>', eg: '<p>3.0 g to 2.4 g: −0.6 ÷ 3.0 × 100 = −20%. The strip lost water, so the solution was more concentrated than the potato cells.</p>' },
    },
    questions: [
      { id: 'os1', skill: 'def', q: 'Osmosis is the movement of…', options: [
        { t: 'water from a dilute solution to a more concentrated one, through a partially permeable membrane', ok: true },
        { t: 'solute particles from a concentrated solution to a dilute one', why: 'That describes diffusion of the solute. Osmosis is about water.' },
        { t: 'water from a concentrated solution to a dilute one', why: 'The direction is reversed. Water moves towards the more concentrated side.' } ],
        explain: 'Osmosis is the net movement of water from a dilute solution to a more concentrated solution through a partially permeable membrane.' },
      { id: 'os2', skill: 'def', q: 'A partially permeable membrane separates A (5% sugar) from B (20% sugar). Which way does water move overall?', options: [
        { t: 'From A to B', ok: true },
        { t: 'From B to A', why: 'B is more concentrated, so water moves towards B.' },
        { t: 'It does not move, because sugar cannot cross', why: 'Osmosis is the water moving. The sugar does not need to cross.' } ],
        explain: 'A is more dilute, so water moves from A into the more concentrated B.' },
      { id: 'os3', skill: 'def', q: 'What must be present for osmosis to happen?', options: [
        { t: 'A partially permeable membrane', ok: true },
        { t: 'A cell wall', why: 'Animal cells have no wall, yet osmosis still happens in them.' },
        { t: 'Energy from respiration', why: 'That is active transport. Osmosis is passive.' } ],
        explain: 'Osmosis needs a partially permeable membrane between two solutions of different concentration. It uses no energy from the cell.' },

      { id: 'os4', skill: 'cells', q: 'A plant cell is placed in pure water. What happens?', options: [
        { t: 'Water enters and the cell becomes turgid', ok: true },
        { t: 'Water enters and the cell bursts', why: 'The cell wall stops a plant cell from bursting.' },
        { t: 'Water leaves and the cell becomes plasmolysed', why: 'Pure water is more dilute than the cell, so water moves in, not out.' } ],
        explain: 'Water moves into the cell by osmosis. The cell swells until the wall pushes back, making it turgid.' },
      { id: 'os5', skill: 'cells', q: 'Red blood cells are placed in a very concentrated salt solution. They will…', options: [
        { t: 'shrink as water leaves by osmosis', ok: true },
        { t: 'burst as water enters', why: 'The solution is more concentrated than the cells, so water moves out.' },
        { t: 'stay the same because of their cell wall', why: 'Red blood cells are animal cells, which have no cell wall.' } ],
        explain: 'Water leaves the cells towards the more concentrated solution, so they shrink.' },
      { id: 'os6', skill: 'cells', q: 'Why do plant cells not burst in pure water?', options: [
        { t: 'The cell wall resists further swelling', ok: true },
        { t: 'The membrane stops water getting in', why: 'Water does get in. That is what makes the cell turgid.' },
        { t: 'Plant cells do not take in water by osmosis', why: 'They do. Root hair cells rely on it.' } ],
        explain: 'Water enters, but the strong cell wall pushes back, so the cell becomes turgid instead of bursting.' },

      { id: 'os7', skill: 'exp', q: 'Potato strips in 30% sugar solution lose mass. Why?', options: [
        { t: 'Water moves out of the potato cells into the solution', ok: true },
        { t: 'Sugar moves out of the potato', why: 'Mass changes here are caused by water moving, not sugar.' },
        { t: 'The cells use up their sugar in respiration', why: 'The change is too fast and too large for respiration. It is osmosis.' } ],
        explain: 'The solution is more concentrated than the potato cells, so water leaves the cells and the strip loses mass.' },
      { id: 'os8', skill: 'exp', q: 'A potato strip goes from 2.0 g to 2.5 g. What is the percentage change?', options: [
        { t: '+25%', ok: true },
        { t: '+20%', why: 'Divide by the starting mass (2.0 g), not the final mass.' },
        { t: '+0.5%', why: '0.5 g is the change in grams. Divide by 2.0 and multiply by 100.' } ],
        explain: '0.5 ÷ 2.0 × 100 = 25%. It gained mass, so the change is +25%.' },
      { id: 'os9', skill: 'exp', q: 'In which solution would a potato strip show no change in mass?', options: [
        { t: 'One with the same concentration as the potato cells', ok: true },
        { t: 'Pure water', why: 'Pure water is more dilute than the cells, so the strip would gain mass.' },
        { t: 'The most concentrated solution', why: 'Water would leave the cells, so the strip would lose mass.' } ],
        explain: 'When the concentrations match there is no net movement of water, so the mass stays the same.' },
    ],
  },

  'rates-of-reaction': {
    subject: 'chemistry', minutes: 11,
    intro: 'Why do some reactions fizz in seconds while others take days? It comes down to how often particles collide, and how hard.',
    sections: [
      { h: 'The big idea', b: '<p>Particles react when they <strong>collide</strong> with at least the <strong>activation energy</strong>. Anything that makes successful collisions happen more often speeds the reaction up.</p>' },
      { h: 'Temperature', b: '<p>Hotter particles move faster. They collide more often <strong>and</strong> more of those collisions have enough energy to react. Give both reasons in exams.</p><div class="eg"><p>Picture Limbe depot on a hot afternoon. Everyone is rushing, so people bump into each other more often, and more of those bumps are hard enough to really shove someone.</p></div>' },
      { h: 'Concentration and surface area', b: '<p>Higher concentration means more particles in the same volume, so collisions happen more often. For gases, higher pressure does the same.</p><p>Smaller pieces or powder have a larger surface area, so more particles are exposed to collide.</p>' },
      { h: 'Catalysts', b: '<p>A catalyst provides a different pathway with a <strong>lower activation energy</strong>. It is not used up. Enzymes are biological catalysts.</p>' },
      { h: 'Measuring rate', b: '<p>Measure how fast a product forms or a reactant is used up, for example gas volume or loss of mass over time. A steeper graph means a faster reaction. The line flattens when a reactant runs out.</p>' },
      { h: 'Common mistakes', b: '<ul><li>Saying a catalyst gives particles more energy. It lowers the energy needed instead.</li><li>Saying higher concentration makes particles move faster. It just packs more of them in.</li><li>Giving only "more collisions" for temperature.</li></ul>' },
    ],
    skills: {
      coll: { name: 'Collision theory', fix: '<p>A reaction needs two things: particles must collide, and the collision must have at least the activation energy.</p><p>Temperature affects both: more collisions, and more of them with enough energy.</p>', eg: '<p>Heating acid from 20 °C to 40 °C: particles move faster, collide more often, and a bigger fraction of collisions pass the activation energy. The rate increases.</p>' },
      fact: { name: 'Concentration and surface area', fix: '<p>Concentration and surface area change how <strong>often</strong> particles collide, not how much energy they have.</p><p>More particles packed in, or more particles exposed, means more frequent collisions.</p>', eg: '<p>Marble chips vs marble powder in the same acid: the powder exposes far more particles, so collisions happen more often and it fizzes faster.</p>' },
      cat: { name: 'Catalysts', fix: '<p>A catalyst does not add energy. It offers an easier route with a lower activation energy, so more collisions succeed.</p><p>It is chemically unchanged at the end and can be used again.</p>', eg: '<p>Manganese(IV) oxide speeds up the breakdown of hydrogen peroxide and can be filtered out and reused afterwards.</p>' },
    },
    questions: [
      { id: 'rr1', skill: 'coll', q: 'For a collision to cause a reaction, the particles must…', options: [
        { t: 'collide with at least the activation energy', ok: true },
        { t: 'simply collide as often as possible', why: 'Frequency matters, but a collision only works if it has enough energy.' },
        { t: 'be the same size', why: 'Particle size is not what decides whether a collision succeeds.' } ],
        explain: 'Only collisions with energy equal to or greater than the activation energy lead to a reaction.' },
      { id: 'rr2', skill: 'coll', q: 'Why does raising the temperature increase the rate?', options: [
        { t: 'Particles collide more often and more collisions have enough energy', ok: true },
        { t: 'Particles get bigger, so they collide more', why: 'Particles do not grow when heated. They move faster.' },
        { t: 'It lowers the activation energy', why: 'That is what a catalyst does. Temperature changes the particles\u2019 energy, not the activation energy.' } ],
        explain: 'Faster particles collide more frequently, and a greater proportion of collisions have at least the activation energy.' },
      { id: 'rr3', skill: 'coll', q: 'The activation energy is…', options: [
        { t: 'the minimum energy colliding particles need to react', ok: true },
        { t: 'the energy given out by the reaction', why: 'That is the energy change of the reaction, a different idea.' },
        { t: 'the extra energy a catalyst gives the particles', why: 'Catalysts do not give energy. They lower the activation energy.' } ],
        explain: 'Activation energy is the minimum energy needed for a collision to result in a reaction.' },

      { id: 'rr4', skill: 'fact', q: 'Magnesium powder reacts faster with acid than a ribbon of the same mass because…', options: [
        { t: 'the powder has a larger surface area, so collisions happen more often', ok: true },
        { t: 'the powder particles have more energy', why: 'Surface area changes how often particles collide, not their energy.' },
        { t: 'powder is a different substance from ribbon', why: 'It is the same magnesium. Only the size of the pieces differs.' } ],
        explain: 'Breaking the metal into powder exposes more particles to the acid, so collisions are more frequent.' },
      { id: 'rr5', skill: 'fact', q: 'Doubling the concentration of acid increases the rate because…', options: [
        { t: 'there are more acid particles in the same volume, so collisions are more frequent', ok: true },
        { t: 'the acid particles move faster', why: 'Particle speed depends on temperature, not concentration.' },
        { t: 'each collision has more energy', why: 'Concentration changes how often particles collide, not how hard.' } ],
        explain: 'More particles in the same space means they collide more often.' },
      { id: 'rr6', skill: 'fact', q: 'Which change will NOT increase the rate of reaction between marble chips and hydrochloric acid?', options: [
        { t: 'Using more acid of the same concentration', ok: true },
        { t: 'Crushing the chips into powder', why: 'Powder increases surface area, which does speed the reaction up.' },
        { t: 'Warming the acid', why: 'Higher temperature does increase the rate.' } ],
        explain: 'Adding more acid at the same concentration does not pack particles closer together, so the rate does not increase.' },

      { id: 'rr7', skill: 'cat', q: 'A catalyst speeds up a reaction by…', options: [
        { t: 'providing a pathway with a lower activation energy', ok: true },
        { t: 'giving the particles more energy', why: 'Catalysts do not add energy. They lower the energy needed.' },
        { t: 'increasing the concentration of the reactants', why: 'A catalyst does not change how much reactant is present.' } ],
        explain: 'With a lower activation energy, more collisions are successful, so the reaction is faster.' },
      { id: 'rr8', skill: 'cat', q: 'What happens to a catalyst by the end of a reaction?', options: [
        { t: 'It is chemically unchanged and can be reused', ok: true },
        { t: 'It is used up like a reactant', why: 'Catalysts are not consumed.' },
        { t: 'It turns into one of the products', why: 'A catalyst is not part of the products.' } ],
        explain: 'A catalyst takes part in the reaction but is left chemically unchanged at the end.' },
      { id: 'rr9', skill: 'cat', q: 'Enzymes are…', options: [
        { t: 'biological catalysts made of protein', ok: true },
        { t: 'reactants that get used up during digestion', why: 'Enzymes are catalysts, so they are not used up.' },
        { t: 'a store of energy for cells', why: 'That describes molecules like glucose or fat.' } ],
        explain: 'Enzymes are proteins that act as catalysts in living things.' },
    ],
  },

  'speed-velocity-acceleration': {
    subject: 'physics', minutes: 10,
    intro: 'How fast, in which direction, and how quickly that is changing. Three ideas that sit behind almost every motion question.',
    sections: [
      { h: 'Speed', b: '<p><strong>Speed = distance ÷ time</strong>, measured in m/s (or km/h).</p><p>Average speed = total distance ÷ total time.</p><div class="eg"><p>A minibus travels 60 km in 1.5 hours: 60 ÷ 1.5 = 40 km/h.</p></div><p>To change km/h into m/s, divide by 3.6.</p>' },
      { h: 'Velocity', b: '<p>Velocity is speed in a stated direction. Two cars at 50 km/h, one going north and one going south, have the same speed but different velocities.</p><p>If you end where you started, your displacement is zero, so your average velocity is zero.</p>' },
      { h: 'Acceleration', b: '<p><strong>Acceleration = change in velocity ÷ time</strong>, a = (v − u) ÷ t, in m/s².</p><div class="eg"><p>0 to 20 m/s in 5 s: (20 − 0) ÷ 5 = 4 m/s²</p><p>15 to 5 m/s in 5 s: (5 − 15) ÷ 5 = −2 m/s², a deceleration.</p></div>' },
      { h: 'Graphs', b: '<ul><li>Distance–time: the gradient is the speed. A flat line means stopped.</li><li>Velocity–time: the gradient is the acceleration. The area underneath is the distance travelled.</li></ul>' },
      { h: 'Common mistakes', b: '<ul><li>Dividing time by distance instead of distance by time.</li><li>Treating speed and velocity as the same thing.</li><li>Losing the minus sign when something slows down.</li></ul>' },
    ],
    skills: {
      speed: { name: 'Calculating speed', fix: '<p>Speed is always distance divided by time. Check your units match: km with hours gives km/h, metres with seconds gives m/s.</p><p>km/h to m/s: divide by 3.6. m/s to km/h: multiply by 3.6.</p>', eg: '<p>A runner covers 400 m in 50 s: 400 ÷ 50 = 8 m/s.</p>' },
      vel: { name: 'Velocity and direction', fix: '<p>Velocity = speed + direction. Change the direction and the velocity changes, even if the speed does not.</p><p>Average velocity uses displacement: how far you end up from where you started, in a straight line.</p>', eg: '<p>Walk 100 m east then 100 m west: distance 200 m, displacement 0 m, so average velocity is 0.</p>' },
      acc: { name: 'Acceleration', fix: '<p>Acceleration = (final velocity − starting velocity) ÷ time. Always subtract in that order, so slowing down gives a negative answer.</p><p>On a velocity–time graph, acceleration is the gradient.</p>', eg: '<p>A bike goes from 10 m/s to 4 m/s in 3 s: (4 − 10) ÷ 3 = −2 m/s².</p>' },
    },
    questions: [
      { id: 'sv1', skill: 'speed', q: 'A cyclist travels 300 m in 60 s. What is the average speed?', options: [
        { t: '5 m/s', ok: true },
        { t: '18,000 m/s', why: 'Distance and time were multiplied. Speed is distance ÷ time.' },
        { t: '0.2 m/s', why: 'That is time ÷ distance. Flip it: distance ÷ time.' } ],
        explain: '300 ÷ 60 = 5 m/s.' },
      { id: 'sv2', skill: 'speed', q: 'A minibus travels 60 km in 1.5 hours. What is its average speed?', options: [
        { t: '40 km/h', ok: true },
        { t: '90 km/h', why: '60 × 1.5 multiplies. Speed is 60 ÷ 1.5.' },
        { t: '0.025 km/h', why: 'That is 1.5 ÷ 60, time over distance.' } ],
        explain: '60 ÷ 1.5 = 40 km/h.' },
      { id: 'sv3', skill: 'speed', q: 'Convert 72 km/h into m/s.', options: [
        { t: '20 m/s', ok: true },
        { t: '259.2 m/s', why: 'To go from km/h to m/s, divide by 3.6, do not multiply.' },
        { t: '1.2 m/s', why: 'Dividing by 60 only converts hours to minutes.' } ],
        explain: '72 ÷ 3.6 = 20 m/s.' },

      { id: 'sv4', skill: 'vel', q: 'Two cars both travel at 50 km/h, one north and one south. Which is true?', options: [
        { t: 'Same speed, different velocities', ok: true },
        { t: 'Same speed and same velocity', why: 'Velocity includes direction. Opposite directions mean different velocities.' },
        { t: 'Different speeds, same velocity', why: 'Both go 50 km/h, so the speeds are equal.' } ],
        explain: 'Speed has no direction, so both are 50 km/h. Velocity does, so they differ.' },
      { id: 'sv5', skill: 'vel', q: 'A runner completes one full 400 m lap in 80 s, finishing where she started. What is her average velocity?', options: [
        { t: '0 m/s', ok: true },
        { t: '5 m/s', why: 'That is her average speed. Velocity uses displacement, which is zero here.' },
        { t: '32,000 m/s', why: 'Distance and time were multiplied.' } ],
        explain: 'She ends where she started, so displacement is 0 and average velocity is 0 m/s.' },
      { id: 'sv6', skill: 'vel', q: 'Which of these includes a direction?', options: [
        { t: 'Velocity', ok: true },
        { t: 'Speed', why: 'Speed only tells you how fast.' },
        { t: 'Distance', why: 'Distance only tells you how far.' } ],
        explain: 'Velocity is a vector: it has size and direction.' },

      { id: 'sv7', skill: 'acc', q: 'A car speeds up from 0 to 20 m/s in 5 s. What is its acceleration?', options: [
        { t: '4 m/s²', ok: true },
        { t: '100 m/s²', why: 'The change in velocity was multiplied by time. Divide instead.' },
        { t: '0.25 m/s²', why: 'That is time ÷ change in velocity. Flip it.' } ],
        explain: '(20 − 0) ÷ 5 = 4 m/s².' },
      { id: 'sv8', skill: 'acc', q: 'A bus slows from 15 m/s to 5 m/s in 5 s. What is its acceleration?', options: [
        { t: '−2 m/s²', ok: true },
        { t: '+2 m/s²', why: 'Final minus starting velocity is 5 − 15 = −10, so the answer is negative.' },
        { t: '3 m/s²', why: 'That uses only the starting velocity. Use the change in velocity.' } ],
        explain: '(5 − 15) ÷ 5 = −2 m/s². The minus sign shows it is slowing down.' },
      { id: 'sv9', skill: 'acc', q: 'On a velocity–time graph, the gradient shows…', options: [
        { t: 'acceleration', ok: true },
        { t: 'distance travelled', why: 'Distance is the area under a velocity–time graph.' },
        { t: 'speed', why: 'Speed is the gradient of a distance–time graph.' } ],
        explain: 'Gradient = change in velocity ÷ time, which is acceleration.' },
    ],
  },
};

export const hasNotes = (topicId) => Boolean(TOPICS[topicId]);
