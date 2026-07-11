/* ============================================================
   Seed data -- shaped like the NewsBucket production schema
   (see docs/05-Database-Schema.md), embedded directly here since
   this is a static, no-backend build for GitHub Pages. Expanded
   to cover football/FIFA, world, crypto, and entertainment so the
   feed feels like a full multi-category app rather than a demo.
   ============================================================ */
const nowTs = Date.now();
const minutesAgo = (m) => new Date(nowTs - m * 60 * 1000).toISOString();

const publishers = {
  p1: { name: 'The Daily Ledger', trust_score: 8.7, bias_rating: 'center', is_verified_partner: true },
  p2: { name: 'National Herald Wire', trust_score: 7.9, bias_rating: 'lean_left', is_verified_partner: true },
  p3: { name: 'Bharat Business Post', trust_score: 8.2, bias_rating: 'lean_right', is_verified_partner: true },
  p4: { name: 'Sportsline India', trust_score: 8.9, bias_rating: 'center', is_verified_partner: true },
  p5: { name: 'Global Football Wire', trust_score: 8.6, bias_rating: 'center', is_verified_partner: true },
  p6: { name: 'Pitchside Daily', trust_score: 8.1, bias_rating: 'center', is_verified_partner: true },
  p7: { name: 'World Affairs Desk', trust_score: 8.5, bias_rating: 'lean_left', is_verified_partner: true },
  p8: { name: 'Crypto Ledger India', trust_score: 7.6, bias_rating: 'center', is_verified_partner: true },
  p9: { name: 'Screen & Stage', trust_score: 7.8, bias_rating: 'center', is_verified_partner: true },
};

function wordsPerMinuteReadTime(text) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

const rawArticles = [
  // ---------------- FOOTBALL / FIFA ----------------
  {
    id: 'fb-001', cluster_id: 'cluster-fifa-wc', publisher: publishers.p5, category_slug: 'football',
    headline: 'FIFA confirms final World Cup qualifying playoff schedule for next year\'s tournament',
    hero_image_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900',
    author_name: 'Marco Ferreira', published_at: minutesAgo(20), is_breaking: true, is_live: false,
    factuality_score: 9.0, bias_rating: 'center', reading_now: 4821,
    body_text: "FIFA on Tuesday confirmed the fixture schedule for the intercontinental playoff round, the final stage of qualification before next year's World Cup. Six teams across four confederations will compete for the last two spots at the tournament, with matches to be played at neutral venues over a single-legged knockout format. The governing body said the format change from previous cycles is intended to reduce travel burden on players during a congested club season. Broadcast rights for the playoff matches have already been secured in over 180 territories, FIFA said, with three of the six teams appearing in their first-ever World Cup playoff.",
    ai_summary: {
      one_line: 'FIFA finalized the World Cup qualifying playoff schedule, with six teams competing for two remaining spots.',
      bullets: [
        'Six teams from four confederations will play a single-legged knockout playoff.',
        'Matches will be held at neutral venues to reduce player travel burden.',
        'Broadcast rights already secured in more than 180 territories.',
      ],
      eli5: 'FIFA decided exactly which teams will play each other in one last round of games to see who gets the final tickets to the World Cup.',
    },
  },
  {
    id: 'fb-002', cluster_id: 'cluster-fifa-wc', publisher: publishers.p6, category_slug: 'football',
    headline: 'Star striker ruled out of World Cup playoff with hamstring injury',
    hero_image_url: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=900',
    author_name: 'Aisha Bello', published_at: minutesAgo(12), is_breaking: true, is_live: false,
    factuality_score: 8.3, bias_rating: 'center', reading_now: 3190,
    body_text: "The national team's leading scorer will miss the upcoming World Cup qualifying playoff after scans confirmed a grade-two hamstring tear picked up in training on Monday. The federation's medical staff estimate a recovery window of four to six weeks, ruling him out of the single-legged knockout tie entirely. The head coach called the injury 'a significant blow' but said the squad has cover in the position. The striker had scored eight goals in the qualifying campaign, second-most in his confederation.",
    ai_summary: {
      one_line: "The team's top scorer will miss the World Cup playoff due to a hamstring injury.",
      bullets: [
        'Scans confirmed a grade-two hamstring tear, 4-6 week recovery expected.',
        'He will miss the single-legged knockout playoff entirely.',
        'He scored 8 goals in qualifying, second-most in his confederation.',
      ],
      eli5: "One of the best goal-scorers hurt his leg muscle and can't play in the big qualifying match.",
    },
  },
  {
    id: 'fb-003', cluster_id: null, publisher: publishers.p5, category_slug: 'football',
    headline: 'Champions League: holders survive late scare to reach semi-finals on away goals',
    hero_image_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=900',
    author_name: 'Marco Ferreira', published_at: minutesAgo(70), is_breaking: false, is_live: false,
    factuality_score: 8.8, bias_rating: 'center', reading_now: 6210,
    body_text: "The reigning Champions League holders needed a stoppage-time equalizer to advance to the semi-finals, drawing 2-2 on the night but progressing 4-3 on aggregate after a dramatic second leg. The visitors had led 2-0 with fifteen minutes remaining before two quick substitutions turned the tie, with a 94th-minute header sending the tie to away-goals countback. The result sets up a semi-final against last season's runners-up, a repeat of a fixture that went to penalties twelve months ago.",
    ai_summary: {
      one_line: 'The Champions League holders advanced to the semi-finals 4-3 on aggregate after a stoppage-time equalizer.',
      bullets: [
        'Drew 2-2 on the night, winning 4-3 on aggregate.',
        'A 94th-minute header sealed progression after trailing 2-0.',
        "Semi-final will be a rematch of last season's penalty-shootout tie.",
      ],
      eli5: 'The champion team almost lost but scored a very late goal to stay in the competition and move to the next round.',
    },
  },
  {
    id: 'fb-004', cluster_id: null, publisher: publishers.p6, category_slug: 'football',
    headline: 'Premier League confirms record broadcast deal starting next season',
    hero_image_url: 'https://images.unsplash.com/photo-1486286701208-1d58e9338013?w=900',
    author_name: 'Aisha Bello', published_at: minutesAgo(150), is_breaking: false, is_live: false,
    factuality_score: 8.9, bias_rating: 'center', reading_now: 2870,
    body_text: "The Premier League announced a record domestic and international broadcast package on Tuesday, worth a combined total higher than the previous three-year cycle. The new deal, running for four seasons starting next year, includes an expanded number of simultaneous kickoff slots and additional matches for international broadcasters. Clubs are expected to see a significant increase in central distribution payments, though the league said a portion of the uplift will be redirected to grassroots and lower-league solidarity payments.",
    ai_summary: {
      one_line: 'The Premier League signed a record broadcast deal for the next four seasons.',
      bullets: [
        'New deal covers four seasons, worth more than the prior three-year cycle.',
        'Includes more simultaneous kickoff slots for international broadcasters.',
        'A share of the increase will go to grassroots and lower-league solidarity payments.',
      ],
      eli5: 'The Premier League made a big new deal with TV channels that will pay clubs even more money to show their games.',
    },
  },
  {
    id: 'fb-005', cluster_id: null, publisher: publishers.p5, category_slug: 'football',
    headline: 'LIVE: Continental Cup final — second half underway, scores level at 1-1',
    hero_image_url: 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=900',
    author_name: 'Live Desk', published_at: minutesAgo(2), is_breaking: true, is_live: true,
    factuality_score: 8.7, bias_rating: 'center', reading_now: 15230,
    body_text: "The Continental Cup final is finely poised at 1-1 as the second half gets underway, following a frantic opening 45 minutes that produced two goals and a disallowed third. The equalizer came from a well-worked corner routine in first-half stoppage time. Both managers made no changes at the break, though fitness staff were seen consulting with the captain of the side chasing the game after he appeared to carry a knock into the interval. A capacity crowd is in attendance for what is being billed as a repeat of a memorable final from six years ago.",
    ai_summary: {
      one_line: 'The Continental Cup final is tied 1-1 as the second half begins.',
      bullets: [
        'Two goals and a disallowed goal in an eventful first half.',
        'The equalizer came from a corner routine in first-half stoppage time.',
        'No substitutions at halftime; one captain may be carrying a knock.',
      ],
      eli5: 'Two football teams are playing in a big final match and the score is tied 1 to 1 at halftime.',
    },
  },
  // ---------------- CRICKET ----------------
  {
    id: 'art-3001', cluster_id: null, publisher: publishers.p4, category_slug: 'cricket',
    headline: 'India seal series win with dominant seven-wicket victory in decider',
    hero_image_url: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=900',
    author_name: 'Karan Mehta', published_at: minutesAgo(15), is_breaking: true, is_live: false,
    factuality_score: 9.3, bias_rating: 'center', reading_now: 9040,
    body_text: "India completed a comprehensive seven-wicket win in the series decider on Tuesday, chasing down a target of 214 with 22 balls to spare. A composed 78 not out anchored the chase after early wickets put the innings under pressure. The bowlers had earlier restricted the opposition to 213 all out, with a career-best five-wicket haul doing the early damage. The result seals a 2-1 series victory and continues India's unbeaten home record this season.",
    ai_summary: {
      one_line: 'India won the series decider by seven wickets, taking the series 2-1.',
      bullets: [
        'Chased down 214 with 22 balls remaining.',
        'An unbeaten 78 anchored the run chase after early wickets fell.',
        'Bowler took a career-best five-wicket haul to restrict the opposition to 213.',
      ],
      eli5: 'The Indian cricket team won the last and most important match of the series, finishing the series ahead 2 wins to 1.',
    },
  },
  {
    id: 'cr-002', cluster_id: null, publisher: publishers.p4, category_slug: 'cricket',
    headline: 'IPL auction: franchises set to spend record sums on uncapped players',
    hero_image_url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=900',
    author_name: 'Karan Mehta', published_at: minutesAgo(200), is_breaking: false, is_live: false,
    factuality_score: 8.5, bias_rating: 'center', reading_now: 4110,
    body_text: "This year's IPL auction is set to see record spending on uncapped domestic players, according to franchise officials briefed ahead of the event. At least four teams have earmarked a larger-than-usual portion of their purse for uncapped talent, reflecting a growing trend of identifying young players early rather than relying solely on established international names. Auction analysts said the shift is partly driven by the salary cap structure introduced two seasons ago, which rewards squad depth over a small number of marquee signings.",
    ai_summary: {
      one_line: 'IPL franchises are expected to spend record amounts on uncapped domestic players this auction.',
      bullets: [
        'At least four teams have set aside a larger share of their purse for uncapped talent.',
        'Reflects a trend toward identifying young players early.',
        'Partly driven by a salary cap structure introduced two seasons ago.',
      ],
      eli5: 'Cricket teams are planning to spend a lot of money buying young players nobody has heard of yet, hoping they turn out to be great.',
    },
  },
  // ---------------- WORLD ----------------
  {
    id: 'wd-001', cluster_id: null, publisher: publishers.p7, category_slug: 'world',
    headline: 'UN climate talks extended by a day as negotiators seek compromise on funding',
    hero_image_url: 'https://images.unsplash.com/photo-1497436072909-f5e4be1713d1?w=900',
    author_name: 'Elena Novak', published_at: minutesAgo(55), is_breaking: false, is_live: false,
    factuality_score: 8.6, bias_rating: 'lean_left', reading_now: 3320,
    body_text: "UN climate negotiations ran a day past their scheduled close as delegates worked to bridge differences over a proposed loss-and-damage funding mechanism for developing nations. Several delegations said a compromise text had narrowed the gap on total contribution levels but that disagreement remained over which countries would be classified as eligible recipients. Observers said an agreement, if reached, would be one of the largest dedicated climate finance commitments to date, though smaller than what vulnerable-nation blocs had originally sought.",
    ai_summary: {
      one_line: 'UN climate talks were extended by a day as negotiators try to agree on a funding mechanism.',
      bullets: [
        'Talks extended over disagreement on a loss-and-damage funding mechanism.',
        'Compromise text narrowed the gap on contribution levels.',
        'Disagreement remains on which countries qualify as eligible recipients.',
      ],
      eli5: 'Countries are still talking about how to share money to help places affected by climate change, and the meeting is taking one extra day.',
    },
  },
  {
    id: 'wd-002', cluster_id: null, publisher: publishers.p7, category_slug: 'world',
    headline: 'Central bank governors signal coordinated caution on rate cuts amid global uncertainty',
    hero_image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=900',
    author_name: 'Elena Novak', published_at: minutesAgo(300), is_breaking: false, is_live: false,
    factuality_score: 8.4, bias_rating: 'center', reading_now: 1980,
    body_text: "Several central bank governors used a joint panel appearance to signal a cautious, coordinated approach to interest rate policy over the coming months, citing persistent uncertainty around trade flows and energy prices. While none committed to a specific rate path, the tone marked a shift from more divergent messaging seen earlier this year. Analysts said the comments suggest policymakers are wary of moving too quickly in either direction given how unevenly inflation has cooled across major economies.",
    ai_summary: {
      one_line: 'Central bank governors signaled a cautious, coordinated approach to future rate decisions.',
      bullets: [
        'Cited uncertainty around trade flows and energy prices.',
        'No specific rate path was committed to.',
        'Marks a shift from more divergent messaging earlier this year.',
      ],
      eli5: 'The people in charge of money and banks around the world are saying they want to be careful and work together before changing interest rates.',
    },
  },
  // ---------------- TECHNOLOGY ----------------
  {
    id: 'art-1001', cluster_id: 'cluster-501', publisher: publishers.p1, category_slug: 'technology',
    headline: 'India unveils national AI compute grid to cut research costs for startups',
    hero_image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900',
    author_name: 'Ritu Sharma', published_at: minutesAgo(42), is_breaking: true, is_live: false,
    factuality_score: 9.1, bias_rating: 'center', reading_now: 5220,
    body_text: "The Ministry of Electronics and IT announced Tuesday a new national AI compute grid, giving startups and university labs subsidized access to GPU clusters previously out of reach for smaller teams. The program allocates an initial 10,000 GPUs across four data centers in Pune, Hyderabad, Bengaluru, and Noida. Officials said the first allocations will go to 200 startups selected through a competitive application process opening next month. The initiative is funded through a public-private partnership with three domestic cloud providers, with total committed funding of 4,500 crore rupees over three years. Industry groups welcomed the move, noting that compute costs have been the single largest barrier for Indian AI startups compared to well-funded counterparts in the US and China.",
    ai_summary: {
      one_line: 'India launches a subsidized national GPU grid to lower AI compute costs for startups.',
      bullets: [
        '10,000 GPUs across 4 cities allocated to startups and university labs.',
        'First cohort of 200 startups selected via application starting next month.',
        '₹4,500 crore committed over three years via public-private partnership.',
      ],
      eli5: "The government is buying a lot of powerful computers and letting small AI companies use them cheaply, so they don't have to spend huge amounts of money to build their own.",
    },
  },
  {
    id: 'art-1002', cluster_id: 'cluster-501', publisher: publishers.p2, category_slug: 'technology',
    headline: 'Startups cautiously optimistic about new government AI compute program',
    hero_image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900',
    author_name: 'Devansh Rao', published_at: minutesAgo(35), is_breaking: false, is_live: false,
    factuality_score: 8.4, bias_rating: 'lean_left', reading_now: 2410,
    body_text: "Founders reacted with cautious optimism to Tuesday's announcement of a national AI compute grid, though several raised concerns about how the 200 initial allocation slots will be judged. 'The devil will be in the selection criteria,' said one Bengaluru-based founder who requested anonymity. The Ministry has not yet published detailed eligibility rules. Some critics also questioned whether four data center locations are sufficient given the geographic spread of India's startup ecosystem, with several hubs in the northeast and other regions left without a nearby facility.",
    ai_summary: {
      one_line: 'Founders welcome the AI compute program but want clearer selection criteria.',
      bullets: [
        'Concerns raised about how the 200 startup slots will be selected.',
        'Eligibility rules not yet published by the Ministry.',
        'Some question geographic coverage of the four data center locations.',
      ],
      eli5: 'Some AI company founders are happy about the free computer access but worried the rules for who gets picked are not clear yet.',
    },
  },
  // ---------------- BUSINESS ----------------
  {
    id: 'art-2001', cluster_id: null, publisher: publishers.p3, category_slug: 'business',
    headline: 'Gold prices ease as investors book profits ahead of RBI policy meeting',
    hero_image_url: 'https://images.unsplash.com/photo-1610375461369-d613b564f4c4?w=900',
    author_name: 'Meera Iyer', published_at: minutesAgo(90), is_breaking: false, is_live: false,
    factuality_score: 8.0, bias_rating: 'lean_right', reading_now: 1650,
    body_text: "Gold prices in domestic markets eased 0.8% on Tuesday as investors booked profits ahead of the Reserve Bank of India's monetary policy announcement expected Thursday. Analysts said a pause or cut in interest rates could renew demand for gold as a hedge, but near-term profit-booking dominated trading. Silver moved in tandem, down 1.1% for the session. Jewellers reported steady retail demand ahead of the upcoming festival season despite the price pullback.",
    ai_summary: {
      one_line: "Gold eased 0.8% on profit booking ahead of Thursday's RBI rate decision.",
      bullets: [
        'Domestic gold prices fell 0.8%, silver down 1.1%.',
        "Traders positioning ahead of Thursday's RBI policy announcement.",
        'Retail jewellery demand reported steady ahead of festival season.',
      ],
      eli5: 'The price of gold went down a little bit because traders are waiting to see what the bank decides about interest rates later this week.',
    },
  },
  {
    id: 'bz-002', cluster_id: null, publisher: publishers.p3, category_slug: 'business',
    headline: 'Domestic airline reports record quarterly profit on lower fuel costs',
    hero_image_url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900',
    author_name: 'Meera Iyer', published_at: minutesAgo(400), is_breaking: false, is_live: false,
    factuality_score: 8.3, bias_rating: 'lean_right', reading_now: 990,
    body_text: "A leading domestic carrier reported its highest-ever quarterly profit, driven by lower aviation fuel costs and stronger-than-expected passenger demand during the travel season. Load factors improved across both domestic and international routes, while ancillary revenue from baggage and seat selection fees also rose. The airline's management said it plans to add new routes next year, funded partly from this quarter's earnings, and reaffirmed guidance for continued profitability through the rest of the fiscal year.",
    ai_summary: {
      one_line: 'A domestic airline posted record quarterly profit on lower fuel costs and strong demand.',
      bullets: [
        'Highest-ever quarterly profit for the carrier.',
        'Lower aviation fuel costs and higher passenger demand drove results.',
        'New routes planned for next year, funded partly by this quarter\'s earnings.',
      ],
      eli5: 'An airline made more money than ever before because fuel got cheaper and more people are flying.',
    },
  },
  // ---------------- CRYPTO ----------------
  {
    id: 'cx-001', cluster_id: null, publisher: publishers.p8, category_slug: 'crypto',
    headline: 'Bitcoin steadies above key support level after volatile trading week',
    hero_image_url: 'https://images.unsplash.com/photo-1621761191319-c6fb01d6f495?w=900',
    author_name: 'Vikram Nair', published_at: minutesAgo(60), is_breaking: false, is_live: false,
    factuality_score: 7.8, bias_rating: 'center', reading_now: 3760,
    body_text: "Bitcoin steadied above a closely watched support level on Tuesday after a volatile week of trading driven by mixed signals on regulatory clarity in major markets. Trading volumes remained elevated compared to the monthly average, with analysts split on whether the recent pullback represents a healthy consolidation or the start of a deeper correction. Several exchange-traded fund providers reported net inflows for the week despite the price swings, suggesting continued institutional interest even amid the volatility.",
    ai_summary: {
      one_line: 'Bitcoin held above a key support level following a volatile week of trading.',
      bullets: [
        'Price steadied after a volatile week tied to regulatory signals.',
        'Trading volumes stayed above the monthly average.',
        'ETF providers reported net inflows despite the price swings.',
      ],
      eli5: 'The price of Bitcoin went up and down a lot this week but stayed above an important level that traders watch closely.',
    },
  },
  {
    id: 'cx-002', cluster_id: null, publisher: publishers.p8, category_slug: 'crypto',
    headline: 'Regulator proposes new disclosure rules for crypto exchanges operating domestically',
    hero_image_url: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=900',
    author_name: 'Vikram Nair', published_at: minutesAgo(500), is_breaking: false, is_live: false,
    factuality_score: 8.1, bias_rating: 'center', reading_now: 1420,
    body_text: "The financial regulator has proposed new disclosure requirements for cryptocurrency exchanges operating in the domestic market, including mandatory reporting of reserve holdings and enhanced customer fund segregation rules. The draft proposal is open for public comment for 45 days before a final rule is expected. Industry bodies said they broadly support the direction of the proposal but raised concerns about the compliance timeline for smaller exchanges.",
    ai_summary: {
      one_line: 'A regulator proposed new disclosure and reserve-reporting rules for crypto exchanges.',
      bullets: [
        'Proposal includes mandatory reserve holding reports and fund segregation rules.',
        'Open for public comment for 45 days.',
        'Industry broadly supportive but concerned about compliance timelines for smaller exchanges.',
      ],
      eli5: 'The government wants crypto exchanges to be more open about how much money they actually have, to protect customers.',
    },
  },
  // ---------------- ENTERTAINMENT ----------------
  {
    id: 'en-001', cluster_id: null, publisher: publishers.p9, category_slug: 'entertainment',
    headline: 'Streaming platform announces record viewership for new original series',
    hero_image_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=900',
    author_name: 'Naina Kapoor', published_at: minutesAgo(130), is_breaking: false, is_live: false,
    factuality_score: 7.9, bias_rating: 'center', reading_now: 2230,
    body_text: "A major streaming platform said its newest original series drew record viewership in its opening weekend, surpassing the platform's previous best launch by a wide margin. The show's showrunners credited word-of-mouth momentum and a marketing campaign focused on regional-language dubbing for the strong numbers outside the show's home market. A second season has already been greenlit, the platform confirmed, with production expected to begin early next year.",
    ai_summary: {
      one_line: "A streaming platform's new original series set a record for opening-weekend viewership.",
      bullets: [
        "Surpassed the platform's previous best series launch by a wide margin.",
        'Regional-language dubbing campaign credited for strong overseas numbers.',
        'A second season has already been greenlit.',
      ],
      eli5: 'A new TV show on a streaming app was watched by more people than any other show has ever gotten on its first weekend.',
    },
  },
];

const articles = rawArticles.map(a => ({ ...a, read_minutes: wordsPerMinuteReadTime(a.body_text) }));
