'use strict';
/*
 * Lesson maps (assets/lesson-maps/lessonmap-<id>.pdf and .jpg): which part of
 * each course the game teaches, topic by topic and lesson by lesson.
 *
 * Rows are the course's own specification areas (unchanged from the 9.11.2026
 * maps). Each entry names a game topic by its id in the game's
 * lib/motor-topic-cards.js; its name and its lessons are read from the game
 * (topicChoices for the board, lessonChoices for the level), so the map says
 * exactly what the teacher sees in the Topic and Lesson selects.
 *
 * Row syntax:   code | spec area | entries
 *   entries:    -                       no game lesson
 *               [code ]topic[:n[+n]]    a game topic (all its lessons, or lessons n)
 *               comma-separated
 *   '# text'    a group heading (theme, unit, component)
 *
 * A lesson sits under a different row from its topic only where the lesson
 * split (game repo handoff/TUNNIT-JAKO-20261118.md, -ERA3.md, -ERA4.md)
 * found its content in that row of the specification.
 */
module.exports = [
  {
    id: 'edexcel-gcse-1bs0', board: 'edexcel-gcse-1bs0', title: 'Edexcel GCSE Business 1BS0',
    head: 'Specification topic', foot: 'Topic numbers follow the Pearson specification.',
    rows: `
# Theme 1: Investigating small business
1.1 | Enterprise and entrepreneurship | -
1.2 | Spotting a business opportunity | market-share
1.3 | Putting a business idea into practice | revenue-costs-profit, break-even, cash-flow, sources-of-finance
1.4 | Making the business effective | -
1.5 | Understanding external influences on business | stakeholders-ethics, external-environment
# Theme 2: Building a business
2.1 | Growing the business | -
2.2 | Making marketing decisions | product-portfolio, pricing, promotion
2.3 | Making operational decisions | production-capacity, stock
2.4 | Making financial decisions | investment-appraisal, financial-ratios
2.5 | Making human resource decisions | organisational-structure, recruitment-training, motivation`,
  },
  {
    id: 'aqa-gcse-8132', board: 'aqa-gcse-8132', title: 'AQA GCSE Business 8132',
    head: 'Specification topic', foot: 'Topic numbers follow the AQA specification.',
    rows: `
3.1 | Business in the real world | 3.1.4 stakeholders-ethics:1, 3.1.7 growth-scale
3.2 | Influences on business | 3.2.2 stakeholders-ethics:2, 3.2.3 external-environment
3.3 | Business operations | 3.3.2 stock
3.4 | Human resources | 3.4.1 organisational-structure, 3.4.2 recruitment-training, 3.4.3 motivation
3.5 | Marketing | 3.5.3 market-share:1, 3.5.2 market-share:2, 3.5.4 product-portfolio, 3.5.4 pricing, 3.5.4 promotion
3.6 | Finance | 3.6.1 sources-of-finance, 3.6.2 cash-flow, 3.6.3 revenue-costs-profit, 3.6.3 break-even, 3.6.3 investment-appraisal, 3.6.4 financial-ratios`,
  },
  {
    id: 'aqa-a-level-7132', board: 'aqa-a-level-7132', title: 'AQA A-level Business 7132',
    head: 'Specification topic', foot: 'Topic numbers follow the AQA specification.',
    rows: `
3.1 | What is business? | -
3.2 | Managers, leadership and decision making | leadership, stakeholders-ethics
3.3 | Marketing management | market-share, product-portfolio, pricing, promotion
3.4 | Operational management | production-capacity, stock
3.5 | Financial management | revenue-costs-profit, sources-of-finance, cash-flow, break-even
3.6 | Human resource management | organisational-structure, motivation, recruitment-training
3.7 | Analysing the strategic position of a business (A-level only) | financial-ratios, external-environment, investment-appraisal
3.8 | Choosing strategic direction (A-level only) | business-strategy
3.9 | Strategic methods: how to pursue strategies (A-level only) | growth-scale
3.10 | Managing strategic change (A-level only) | -`,
  },
  {
    id: 'aqa-a-level-7138', board: 'aqa-a-level-7138', title: 'AQA A-level Business 7138',
    head: 'Specification topic', foot: 'Topic numbers follow the AQA specification.',
    rows: `
# 3.1 Unit: What is business? Managing marketing and finance
3.1.1 | Business and objectives | -
3.1.2 | Forms of business and stakeholders | stakeholders-ethics
3.1.3 | Marketing management | market-share, product-portfolio, pricing, promotion
3.1.4 | Financial management | revenue-costs-profit, sources-of-finance, cash-flow, break-even, financial-ratios
# 3.2 Unit: Managing people and operations
3.2.1 | People management | leadership, organisational-structure, motivation, recruitment-training
3.2.2 | Operations management | production-capacity, stock, growth-scale
3.2.3 | Managing business culture (A-level) | -
# 3.3 Unit: Business and society, the external environment and strategy (A-level only)
3.3.1 | Business and society | -
3.3.2 | Business and the external environment | external-environment
3.3.3 | Strategy | business-strategy, investment-appraisal
3.3.4 | Change | -`,
  },
  {
    id: 'edexcel-a-level-9bs0', board: 'edexcel-a-level-9bs0', title: 'Edexcel A level Business 9BS0',
    head: 'Specification topic', foot: 'Topic numbers follow the Pearson specification.',
    rows: `
# Theme 1: Marketing and people
1.1 | Meeting customer needs | market-share
1.2 | Market | pricing:2
1.3 | Marketing mix and strategy | promotion, pricing:1, product-portfolio
1.4 | Managing people | recruitment-training, organisational-structure, motivation, leadership
1.5 | Entrepreneurs and leaders | -
# Theme 2: Managing business activities
2.1 | Raising finance | sources-of-finance
2.2 | Financial planning | revenue-costs-profit:1, break-even
2.3 | Managing finance | cash-flow, revenue-costs-profit:2, financial-ratios
2.4 | Resource management | production-capacity, stock
2.5 | External influences | external-environment
# Theme 3: Business decisions and strategy
3.1 | Business objectives and strategy | business-strategy
3.2 | Business growth | growth-scale
3.3 | Decision-making techniques | investment-appraisal
3.4 | Influences on business decisions | stakeholders-ethics
3.5 | Assessing competitiveness | -
3.6 | Managing change | -
# Theme 4: Global business
4.1 | Globalisation | -
4.2 | Global markets and business expansion | -
4.3 | Global marketing | -
4.4 | Global industries and companies (multinational corporations) | -`,
  },
  {
    id: 'edexcel-igcse-4bs1', board: 'pearson-igcse-4bs1', title: 'Edexcel International GCSE Business 4BS1',
    head: 'Specification topic', foot: 'Topic numbers follow the Pearson specification.',
    rows: `
1 | Business activity and influences on business | 1.2 stakeholders-ethics, 1.5 external-environment
2 | People in business | 2.2 recruitment-training, 2.4 motivation, 2.5 organisational-structure
3 | Business finance | 3.1 sources-of-finance, 3.2 cash-flow, 3.3 revenue-costs-profit, 3.3 break-even, 3.5 financial-ratios
4 | Marketing | 4.2 market-share, 4.3 product-portfolio, 4.3 pricing, 4.3 promotion
5 | Business operations | 5.1 growth-scale, 5.2 production-capacity, 5.2 stock
App. 3 | Quantitative skills | investment-appraisal`,
  },
  {
    id: 'edexcel-ial-business', board: 'pearson-ial-business', title: 'Edexcel International A level Business',
    head: 'Specification topic', foot: 'Topic numbers follow the Pearson specification.',
    rows: `
# Unit 1: Marketing and people
1.3.1 | Meeting customer needs | market-share
1.3.2 | The market | pricing:2
1.3.3 | Marketing mix and strategy | promotion, pricing:1, product-portfolio
1.3.4 | Managing people | recruitment-training, organisational-structure, motivation
1.3.5 | Entrepreneurs and leaders | leadership
# Unit 2: Managing business activities
2.3.1 | Planning a business and raising finance | sources-of-finance
2.3.2 | Financial planning | revenue-costs-profit:1, break-even
2.3.3 | Managing finance | cash-flow, revenue-costs-profit:2, financial-ratios
2.3.4 | Resource management | production-capacity, stock
2.3.5 | External influences | external-environment
# Unit 3: Business decisions and strategy
3.3.1 | Business objectives and strategy | business-strategy
3.3.2 | Business growth | growth-scale
3.3.3 | Decision-making techniques | investment-appraisal
3.3.4 | Influences on business decisions | stakeholders-ethics
3.3.5 | Assessing competitiveness | -
3.3.6 | Managing change | -
# Unit 4: Global business
4.3.1 | Globalisation | -
4.3.2 | Global markets and business expansion | -
4.3.3 | Global marketing | -
4.3.4 | Global industries and companies (multinational corporations) | -`,
  },
  {
    id: 'btec-tech-award-enterprise', board: 'pearson-btec-l2-business', title: 'BTEC Tech Award Enterprise',
    head: 'Specification topic', foot: 'Learning aim letters follow the Pearson specification.',
    rows: `
# Component 1: Exploring Enterprises
A | Understand how and why enterprises and entrepreneurs are successful | -
B | Understand customer needs and competitor behaviour through market research | -
C | Understand how the outcomes of situational analyses may affect enterprises | external-environment
# Component 2: Planning and Presenting a Micro-Enterprise Idea
A | Choose an idea and produce a plan for a micro-enterprise idea | -
B | Present a plan for the micro-enterprise idea to meet specific requirements | -
C | Review the presentation of the micro-enterprise idea to meet specific requirements | -
# Component 3: Marketing and Finance for Enterprise
A | Marketing activities | pricing, promotion, product-portfolio
B | Financial documents and statements | revenue-costs-profit, financial-ratios
C | Financial planning and forecasting | cash-flow, break-even, sources-of-finance`,
  },
  {
    id: 'btec-l3-national', board: 'pearson-btec-l3-business', title: 'BTEC National Business',
    head: 'Specification topic', foot: 'Learning aim letters follow the Pearson specification.',
    rows: `
# Unit 1: Exploring Business
A | Explore the features of different businesses and analyse what makes them successful | stakeholders-ethics
B | Investigate how businesses are organised | organisational-structure
C | Examine the environment in which businesses operate | external-environment
D | Examine business markets | -
E | Investigate the role and contribution of innovation and enterprise to business success | -
# Unit 2: Developing a Marketing Campaign
A | Introduction to the principles and purposes of marketing that underpin the creation of a rationale for a marketing campaign | market-share
B | Using information to develop the rationale for a marketing campaign | -
C | Planning and developing a marketing campaign | pricing, promotion
# Unit 3: Personal and Business Finance
A | Understand the importance of managing personal finance | -
B | Explore the personal finance sector | -
C | Understand the purpose of accounting | -
D | Select and evaluate different sources of business finance | sources-of-finance
E | Break-even and cash flow forecasts | cash-flow, break-even
F | Complete statements of comprehensive income and financial position and evaluate a business's performance | revenue-costs-profit, financial-ratios`,
  },
  {
    id: 'ocr-gcse-j204', board: 'ocr-gcse-j204', title: 'OCR GCSE Business J204',
    head: 'Specification topic', foot: 'Topic numbers follow the OCR specification.',
    rows: `
1 | Business activity | 1.5 stakeholders-ethics:1
2 | Marketing | 2.3 market-share, 2.4 pricing, 2.4 promotion, 2.4 product-portfolio
3 | People | 3.2 organisational-structure, 3.4 recruitment-training, 3.5 motivation
4 | Operations | -
5 | Finance | 5.2 sources-of-finance, 5.3 revenue-costs-profit, 5.3 investment-appraisal, 5.3 financial-ratios, 5.4 break-even, 5.5 cash-flow
6 | Influences on business | 6.1 stakeholders-ethics:2
7 | The interdependent nature of business | -`,
  },
  {
    id: 'ocr-a-level-h431', board: 'ocr-a-level-h436', title: 'OCR A Level Business H431',
    head: 'Specification topic', foot: 'Topic names follow the OCR specification.',
    rows: `
 | Introduction to Business | -
 | Business objectives and strategy | business-strategy, stakeholders-ethics
 | External influences | external-environment
 | Change | -
 | Accounting and finance within a business environment | sources-of-finance, cash-flow
 | Management accounting | break-even, revenue-costs-profit, investment-appraisal
 | Financial accounting | financial-ratios
 | Accounting and finance within the external environment | -
 | The finance strategy | -
 | Human resource management within a business environment | organisational-structure
 | The workforce | recruitment-training, motivation
 | Management | leadership
 | Human resources within the external environment | -
 | The human resources strategy | -
 | Marketing within a business environment | -
 | Customer needs | market-share
 | The marketing strategy | product-portfolio, pricing, promotion
 | Marketing within the external environment | -
 | Operations management within a business environment | -
 | The production process | -
 | Productive efficiency | stock, production-capacity, growth-scale
 | Productive quality (fit for purpose) | -
 | Operations management within the external environment | -
 | The operations strategy | -`,
  },
  {
    id: 'ocr-a-level-h436', board: 'ocr-a-level-h436', title: 'OCR A Level Business H436',
    head: 'Specification topic', foot: 'Topic numbers follow the OCR specification.',
    rows: `
1 | Business activity | 1.3 stakeholders-ethics:1, 1.4 growth-scale:2, 1.5 growth-scale:1
2 | Marketing | 2.3 market-share, 2.4 pricing, 2.4 promotion, 2.4 product-portfolio
3 | People | 3.2 organisational-structure, 3.3 motivation, 3.4 leadership, 3.6 recruitment-training
4 | Operations | 4.2 production-capacity:1, 4.4 production-capacity:2, 4.5 stock
5 | Finance | 5.2 break-even, 5.2 revenue-costs-profit, 5.4 cash-flow, 5.5 sources-of-finance, 5.7 financial-ratios
6 | External influences | 6.3 external-environment
7 | Strategy, risk and managing change | 7.2 business-strategy, 7.4 investment-appraisal, 7.7 stakeholders-ethics:2`,
  },
  {
    id: 'cambridge-igcse-0264', board: 'cambridge-igcse-0264', title: 'Cambridge IGCSE Business 0264',
    head: 'Syllabus topic', foot: 'Topic numbers follow the Cambridge syllabus.',
    rows: `
1 | Understanding business activity | 1.3 growth-scale:1, 1.5 stakeholders-ethics
2 | People in business | 2.1 recruitment-training, 2.2 leadership, 2.2 organisational-structure, 2.4 motivation
3 | Marketing | 3.1 market-share, 3.3 pricing, 3.3 promotion, 3.3 product-portfolio
4 | Operations management | 4.1 stock, 4.1 production-capacity, 4.4 growth-scale:2, 4.4 break-even
5 | Financial information and decisions | 5.1 sources-of-finance, 5.2 cash-flow, 5.3 revenue-costs-profit, 5.5 financial-ratios
6 | External influences on business activity | 6.1 external-environment`,
  },
  {
    id: 'cambridge-igcse-0450', board: 'cambridge-igcse-0264', title: 'Cambridge IGCSE Business Studies 0450',
    head: 'Syllabus topic', foot: 'Topic numbers follow the Cambridge syllabus.',
    rows: `
1 | Understanding business activity | 1.3 growth-scale, 1.5 stakeholders-ethics
2 | People in business | 2.1 motivation, 2.2 leadership, 2.2 organisational-structure, 2.3 recruitment-training
3 | Marketing | 3.1 market-share, 3.3 pricing, 3.3 promotion, 3.3 product-portfolio
4 | Operations management | 4.1 stock, 4.1 production-capacity, 4.2 break-even
5 | Financial information and decisions | 5.1 sources-of-finance, 5.2 cash-flow, 5.3 revenue-costs-profit, 5.5 financial-ratios
6 | External influences on business activity | 6.1 external-environment`,
  },
  {
    id: 'ib-business-hl', board: 'ib-business-hl', title: 'IB Business Management HL',
    head: 'Guide topic', foot: 'Topic numbers follow the IB guide.',
    rows: `
Unit 1 | Introduction to business management | 1.4 stakeholders-ethics, 1.5 growth-scale
Unit 2 | Human resource management | 2.1 recruitment-training, 2.2 organisational-structure, 2.3 leadership, 2.4 motivation
Unit 3 | Finance and accounts | 3.2 sources-of-finance, 3.3 revenue-costs-profit:1, 3.4 revenue-costs-profit:2, 3.5 financial-ratios, 3.7 cash-flow, 3.8 investment-appraisal
Unit 4 | Marketing | 4.1 market-share, 4.5 pricing, 4.5 promotion, 4.5 product-portfolio
Unit 5 | Operations management | 5.5 break-even, 5.6 production-capacity, 5.6 stock`,
  },
  {
    id: 'ib-business-sl', board: 'ib-business-sl', title: 'IB Business Management SL',
    head: 'Guide topic', foot: 'Topic numbers follow the IB guide.',
    rows: `
Unit 1 | Introduction to business management | 1.4 stakeholders-ethics, 1.5 growth-scale
Unit 2 | Human resource management | 2.1 recruitment-training, 2.2 organisational-structure, 2.3 leadership, 2.4 motivation
Unit 3 | Finance and accounts | 3.2 sources-of-finance, 3.3 revenue-costs-profit:1, 3.4 revenue-costs-profit:2, 3.5 financial-ratios, 3.7 cash-flow, 3.8 investment-appraisal
Unit 4 | Marketing | 4.1 market-share, 4.5 pricing, 4.5 promotion, 4.5 product-portfolio
Unit 5 | Operations management | 5.5 break-even`,
  },
];
