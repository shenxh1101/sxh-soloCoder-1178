import type { User, Course, Chapter, Question, Announcement } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'student-01',
    name: '张同学',
    email: 'student@example.com',
    role: 'student',
    avatar: '',
    createdAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'teacher-01',
    name: '李老师',
    email: 'teacher@example.com',
    role: 'teacher',
    avatar: '',
    createdAt: '2024-09-01T08:00:00Z',
  },
];

export const mockCourses: Course[] = [
  {
    id: 'course-01',
    title: '初级会计实务',
    subject: '会计',
    description: '掌握会计核算基本原理与实务操作，涵盖资产、负债、所有者权益等核心内容',
    totalChapters: 8,
    coverColor: '#1e3a5f',
  },
  {
    id: 'course-02',
    title: '经济法基础',
    subject: '法律',
    description: '学习经济法律关系、合同法、公司法等经济法律基础知识',
    totalChapters: 7,
    coverColor: '#c9a96e',
  },
  {
    id: 'course-03',
    title: '财务管理',
    subject: '管理',
    description: '系统学习财务管理理论、资金时间价值、投资决策与财务分析方法',
    totalChapters: 6,
    coverColor: '#e07b5a',
  },
];

export const mockChapters: Chapter[] = [
  // 初级会计实务 (course-01)
  { id: 'ch-01-01', courseId: 'course-01', title: '第一章 会计概述', order: 1, materials: [
    { type: 'document', title: '会计概念与目标', content: '会计是以货币为主要计量单位，采用专门方法和程序，对企业和行政、事业单位的经济活动进行完整的、连续的、系统的核算和监督，以提供经济信息和反映受托责任履行情况为主要目的的经济管理活动。\n\n会计的基本职能包括核算职能和监督职能。核算职能是指会计以货币为主要计量单位，对特定主体的经济活动进行确认、计量、记录和报告。监督职能是指对特定主体经济活动和相关会计核算的真实性、合法性和合理性进行审查。', url: '' },
    { type: 'document', title: '会计基本假设', content: '会计基本假设是企业会计确认、计量和报告的前提，是对会计核算所处时间、空间环境等所作的合理假定。包括：\n\n1. 会计主体：明确会计工作的空间范围\n2. 持续经营：在可预见的将来，企业将会按当前的规模和状态继续经营下去\n3. 会计分期：将企业持续经营的生产经营活动划分为一个个连续的、长短相同的期间\n4. 货币计量：会计主体在会计确认、计量和报告时以货币计量', url: '' },
    { type: 'document', title: '会计信息质量要求', content: '会计信息质量要求是对企业财务报告中所提供会计信息质量的基本要求，是使财务报告中所提供会计信息对投资者等使用者决策有用应具备的基本特征。\n\n主要包括：可靠性、相关性、可理解性、可比性、实质重于形式、重要性、谨慎性和及时性。', url: '' },
  ]},
  { id: 'ch-01-02', courseId: 'course-01', title: '第二章 资产', order: 2, materials: [
    { type: 'document', title: '货币资金', content: '货币资金是指企业生产经营过程中处于货币形态的资产，包括库存现金、银行存款和其他货币资金。\n\n库存现金的管理包括现金使用范围、现金限额管理和现金日常收支管理。银行存款是企业存放在银行或其他金融机构的货币资金。其他货币资金包括外埠存款、银行汇票存款、银行本票存款、信用卡存款、信用证保证金存款和存出投资款等。', url: '' },
    { type: 'document', title: '应收及预付款项', content: '应收及预付款项是指企业在日常生产经营过程中发生的各项债权，包括应收票据、应收账款、预付账款、应收股利、应收利息和其他应收款等。\n\n应收账款入账价值包括销售商品或提供劳务的价款、增值税销项税额，以及代购货方垫付的包装费、运杂费等。', url: '' },
  ]},
  { id: 'ch-01-03', courseId: 'course-01', title: '第三章 负债', order: 3, materials: [
    { type: 'document', title: '短期借款与应付账款', content: '短期借款是指企业向银行或其他金融机构等借入的期限在1年以下（含1年）的各种借款。短期借款的利息应作为财务费用计入当期损益。\n\n应付账款是指企业因购买材料、商品或接受劳务供应等经营活动应支付的款项。应付账款一般按应付金额入账。', url: '' },
  ]},
  { id: 'ch-01-04', courseId: 'course-01', title: '第四章 所有者权益', order: 4, materials: [
    { type: 'document', title: '实收资本与资本公积', content: '实收资本是指企业按照章程规定或合同、协议约定，接受投资者投入企业的资本。实收资本的构成比例是企业据以向投资者进行利润或股利分配的主要依据。\n\n资本公积是企业收到投资者的超出其在企业注册资本（或股本）中所占份额的投资，以及直接计入所有者权益的利得和损失等。', url: '' },
  ]},
  { id: 'ch-01-05', courseId: 'course-01', title: '第五章 收入、费用和利润', order: 5, materials: [
    { type: 'document', title: '收入的确认与计量', content: '收入是指企业在日常活动中形成的、会导致所有者权益增加的、与所有者投入资本无关的经济利益的总流入。\n\n企业应当在履行了合同中的履约义务，即在客户取得相关商品控制权时确认收入。取得相关商品控制权，是指能够主导该商品的使用并从中获得几乎全部的经济利益。', url: '' },
  ]},
  { id: 'ch-01-06', courseId: 'course-01', title: '第六章 财务报表', order: 6, materials: [
    { type: 'document', title: '资产负债表', content: '资产负债表是反映企业在某一特定日期财务状况的报表，是对企业资产、负债和所有者权益的静态反映。\n\n资产负债表的编制依据是"资产=负债+所有者权益"这一会计恒等式。资产按流动性排列，负债按偿还期限排列。', url: '' },
  ]},
  { id: 'ch-01-07', courseId: 'course-01', title: '第七章 管理会计基础', order: 7, materials: [
    { type: 'document', title: '成本性态分析', content: '成本性态是指成本总额与业务量之间的依存关系。按照成本性态，可将成本分为固定成本、变动成本和混合成本三类。\n\n固定成本：在一定时期和一定业务量范围内，成本总额不受业务量变动影响而保持固定不变的成本。\n\n变动成本：成本总额与业务量成正比例变动的成本。', url: '' },
  ]},
  { id: 'ch-01-08', courseId: 'course-01', title: '第八章 政府会计基础', order: 8, materials: [
    { type: 'document', title: '政府会计概述', content: '政府会计是会计体系的重要分支，是运用会计专门方法对政府及其组成主体的财务状况、运行情况、现金流量、预算执行等情况进行全面、系统、连续的核算和监督的专业会计。\n\n政府会计由预算会计和财务会计构成。预算会计实行收付实现制，财务会计实行权责发生制。', url: '' },
  ]},

  // 经济法基础 (course-02)
  { id: 'ch-02-01', courseId: 'course-02', title: '第一章 总论', order: 1, materials: [
    { type: 'document', title: '法律基础', content: '法律是由国家制定或认可，并以国家强制力保证实施的行为规范的总和。经济法是调整国家在管理与协调经济运行过程中发生的经济关系的法律规范的总称。\n\n经济法律关系由主体、内容和客体三个要素构成。', url: '' },
  ]},
  { id: 'ch-02-02', courseId: 'course-02', title: '第二章 劳动合同与社会保险', order: 2, materials: [
    { type: 'document', title: '劳动合同的订立', content: '劳动合同是劳动者与用人单位确立劳动关系、明确双方权利和义务的协议。建立劳动关系应当订立劳动合同。\n\n劳动合同应当具备用人单位的名称、住所和法定代表人，劳动者的姓名、住址和身份证号码，劳动合同期限，工作内容和工作地点，工作时间和休息休假，劳动报酬，社会保险等条款。', url: '' },
  ]},
  { id: 'ch-02-03', courseId: 'course-02', title: '第三章 支付结算法律制度', order: 3, materials: [
    { type: 'document', title: '支付结算概述', content: '支付结算是指单位、个人在社会经济活动中使用票据、信用卡和汇兑、托收承付、委托收款等结算方式进行货币给付及资金清算的行为。\n\n支付结算的基本原则包括：恪守信用履约付款原则、谁的钱进谁的账由谁支配原则、银行不垫款原则。', url: '' },
  ]},
  { id: 'ch-02-04', courseId: 'course-02', title: '第四章 增值税法律制度', order: 4, materials: [
    { type: 'document', title: '增值税概述', content: '增值税是以商品（含应税劳务）在流转过程中产生的增值额作为计税依据而征收的一种流转税。增值税实行价外税，即由消费者负担，有增值才征税，没增值不征税。\n\n增值税一般纳税人适用一般计税方法，应纳税额=当期销项税额-当期进项税额。', url: '' },
  ]},
  { id: 'ch-02-05', courseId: 'course-02', title: '第五章 企业所得税', order: 5, materials: [
    { type: 'document', title: '企业所得税概述', content: '企业所得税是对我国境内的企业和其他取得收入的组织的生产经营所得和其他所得征收的一种所得税。\n\n企业所得税的税率为25%。符合条件的小型微利企业，减按20%的税率征收企业所得税。国家需要重点扶持的高新技术企业，减按15%的税率征收企业所得税。', url: '' },
  ]},
  { id: 'ch-02-06', courseId: 'course-02', title: '第六章 其他税收法律制度', order: 6, materials: [
    { type: 'document', title: '消费税', content: '消费税是对在我国境内从事生产、委托加工和进口应税消费品的单位和个人，就其销售额或销售数量，在特定环节征收的一种税。\n\n消费税的征收范围包括：烟、酒、高档化妆品、贵重首饰及珠宝玉石、鞭炮焰火、成品油、摩托车、小汽车、高尔夫球及球具、高档手表、游艇、木制一次性筷子、实木地板、电池、涂料。', url: '' },
  ]},
  { id: 'ch-02-07', courseId: 'course-02', title: '第七章 税收征收管理法', order: 7, materials: [
    { type: 'document', title: '税务管理', content: '税务管理是税收征收管理的主要内容，是税款征收的前提和基础。税务管理主要包括税务登记、账簿和凭证管理、纳税申报等内容。\n\n从事生产、经营的纳税人，应当自领取营业执照之日起30日内，向生产、经营地或者纳税义务发生地的主管税务机关申报办理税务登记。', url: '' },
  ]},

  // 财务管理 (course-03)
  { id: 'ch-03-01', courseId: 'course-03', title: '第一章 总论', order: 1, materials: [
    { type: 'document', title: '财务管理概述', content: '财务管理是企业管理的一个组成部分，是根据财经法规制度，按照财务管理的原则，组织企业财务活动，处理财务关系的一项经济管理工作。\n\n企业财务活动包括筹资活动、投资活动、资金营运活动和分配活动。财务管理目标主要有利润最大化、股东财富最大化和企业价值最大化。', url: '' },
  ]},
  { id: 'ch-03-02', courseId: 'course-03', title: '第二章 财务管理基础', order: 2, materials: [
    { type: 'document', title: '资金时间价值', content: '资金时间价值是指一定量资金在不同时点上的价值量差额。资金时间价值是资金在周转使用中由于时间因素而形成的差额价值。\n\n资金时间价值的表现形式有绝对数（利息）和相对数（利率）两种。通常情况下，资金时间价值相当于没有风险和没有通货膨胀条件下的社会平均资金利润率。', url: '' },
  ]},
  { id: 'ch-03-03', courseId: 'course-03', title: '第三章 预算管理', order: 3, materials: [
    { type: 'document', title: '预算管理概述', content: '预算是企业在预测、决策的基础上，以数量和金额的形式反映企业未来一定时期内经营、投资、财务等活动的具体计划，是为实现企业目标而对各种资源和企业活动做的详细安排。\n\n预算具有计划、沟通和协调、资源分配、业绩考核等功能。预算编制方法包括固定预算与弹性预算、增量预算与零基预算、定期预算与滚动预算。', url: '' },
  ]},
  { id: 'ch-03-04', courseId: 'course-03', title: '第四章 筹资管理', order: 4, materials: [
    { type: 'document', title: '筹资方式', content: '筹资是指企业为了满足其经营活动、投资活动、资本结构调整等需要，运用一定的筹资方式，筹措和获取所需资金的一种行为。\n\n筹资方式主要有吸收直接投资、发行股票、发行债券、向金融机构借款、融资租赁、商业信用等。筹资渠道包括国家财政资金、银行信贷资金、非银行金融机构资金、其他企业资金、居民个人资金和企业自留资金。', url: '' },
  ]},
  { id: 'ch-03-05', courseId: 'course-03', title: '第五章 投资管理', order: 5, materials: [
    { type: 'document', title: '项目投资决策', content: '项目投资是指以特定建设项目为对象，直接与新建项目或更新改造项目有关的长期投资行为。\n\n项目投资决策评价指标包括非折现指标（投资回收期、投资利润率）和折现指标（净现值、净现值率、现值指数、内含报酬率）。其中净现值法是项目投资决策中最常用的方法。', url: '' },
  ]},
  { id: 'ch-03-06', courseId: 'course-03', title: '第六章 营运资金管理', order: 6, materials: [
    { type: 'document', title: '现金管理', content: '营运资金是指流动资产减去流动负债后的余额。现金是流动性最强的资产，包括库存现金、各种形式的银行存款和银行本票、银行汇票。\n\n企业持有现金的动机包括交易性动机、预防性动机和投机性动机。最佳现金持有量的确定方法有成本分析模式、存货模式和随机模式。', url: '' },
  ]},
];

function generateQuestionId(chapterId: string, index: number): string {
  return `q-${chapterId}-${String(index).padStart(2, '0')}`;
}

export const mockQuestions: Question[] = [
  // ch-01-01 会计概述
  { id: generateQuestionId('ch-01-01', 1), chapterId: 'ch-01-01', knowledgePoint: '会计概念', type: 'single', content: '会计的基本职能是（ ）。', options: ['A. 核算和决策', 'B. 核算和监督', 'C. 监督和分析', 'D. 预测和决策'], answer: 'B', explanation: '会计的基本职能包括核算职能和监督职能。核算职能是基础，监督职能是保障。', difficulty: 'easy' },
  { id: generateQuestionId('ch-01-01', 2), chapterId: 'ch-01-01', knowledgePoint: '会计假设', type: 'single', content: '下列各项中，不属于会计基本假设的是（ ）。', options: ['A. 会计主体', 'B. 持续经营', 'C. 会计分期', 'D. 权责发生制'], answer: 'D', explanation: '会计基本假设包括会计主体、持续经营、会计分期和货币计量。权责发生制属于会计基础，不属于会计基本假设。', difficulty: 'easy' },
  { id: generateQuestionId('ch-01-01', 3), chapterId: 'ch-01-01', knowledgePoint: '会计信息质量', type: 'single', content: '企业应当按照交易或事项的经济实质进行会计确认、计量和报告，不应仅以交易或事项的法律形式为依据。这体现的会计信息质量要求是（ ）。', options: ['A. 可靠性', 'B. 相关性', 'C. 实质重于形式', 'D. 可比性'], answer: 'C', explanation: '实质重于形式要求企业应当按照交易或事项的经济实质进行会计确认、计量和报告，不应仅以交易或事项的法律形式为依据。', difficulty: 'medium' },
  { id: generateQuestionId('ch-01-01', 4), chapterId: 'ch-01-01', knowledgePoint: '会计基础', type: 'judge', content: '权责发生制是以收到或支付现金作为确认收入和费用的依据。', options: ['A. 正确', 'B. 错误'], answer: 'B', explanation: '权责发生制是以权利和责任的发生来确定收入和费用归属期，而不是以现金的收付为依据。以现金收付为依据的是收付实现制。', difficulty: 'easy' },
  { id: generateQuestionId('ch-01-01', 5), chapterId: 'ch-01-01', knowledgePoint: '会计信息质量', type: 'single', content: '下列各项中，体现谨慎性会计信息质量要求的是（ ）。', options: ['A. 将融资租入固定资产作为自有资产核算', 'B. 计提存货跌价准备', 'C. 将长期借款利息资本化', 'D. 对存货采用先进先出法计价'], answer: 'B', explanation: '谨慎性要求企业对交易或事项进行会计确认、计量和报告时保持应有的谨慎，不应高估资产或收益、低估负债或费用。计提存货跌价准备体现了不高估资产的要求。', difficulty: 'medium' },

  // ch-01-02 资产
  { id: generateQuestionId('ch-01-02', 1), chapterId: 'ch-01-02', knowledgePoint: '货币资金', type: 'single', content: '下列各项中，不属于其他货币资金的是（ ）。', options: ['A. 银行汇票存款', 'B. 银行本票存款', 'C. 信用卡存款', 'D. 库存现金'], answer: 'D', explanation: '其他货币资金包括外埠存款、银行汇票存款、银行本票存款、信用卡存款、信用证保证金存款和存出投资款。库存现金属于货币资金但不属于其他货币资金。', difficulty: 'easy' },
  { id: generateQuestionId('ch-01-02', 2), chapterId: 'ch-01-02', knowledgePoint: '应收账款', type: 'single', content: '企业销售商品时代垫的运杂费应计入（ ）。', options: ['A. 销售费用', 'B. 应收账款', 'C. 其他应收款', 'D. 管理费用'], answer: 'B', explanation: '应收账款入账价值包括销售商品或提供劳务的价款、增值税销项税额，以及代购货方垫付的包装费、运杂费等。', difficulty: 'medium' },
  { id: generateQuestionId('ch-01-02', 3), chapterId: 'ch-01-02', knowledgePoint: '存货', type: 'single', content: '某企业采用先进先出法计算发出材料的成本。2024年3月1日结存A材料200吨，每吨实际成本200元；3月5日购进A材料300吨，每吨实际成本180元；3月15日发出A材料400吨。3月末库存A材料的实际成本为（ ）元。', options: ['A. 18000', 'B. 19000', 'C. 20000', 'D. 21000'], answer: 'A', explanation: '先进先出法下，发出400吨先发出期初200吨（200元/吨），再发出3月5日购进的200吨（180元/吨）。期末库存为3月5日剩余的100吨，成本=100×180=18000元。', difficulty: 'hard' },

  // ch-01-03 负债
  { id: generateQuestionId('ch-01-03', 1), chapterId: 'ch-01-03', knowledgePoint: '短期借款', type: 'single', content: '企业计提短期借款利息时，应贷记的科目是（ ）。', options: ['A. 财务费用', 'B. 应付利息', 'C. 短期借款', 'D. 银行存款'], answer: 'B', explanation: '计提短期借款利息时，应借记"财务费用"科目，贷记"应付利息"科目。', difficulty: 'easy' },
  { id: generateQuestionId('ch-01-03', 2), chapterId: 'ch-01-03', knowledgePoint: '应付账款', type: 'judge', content: '应付账款附有现金折扣的，应按照扣除现金折扣后的金额入账。', options: ['A. 正确', 'B. 错误'], answer: 'B', explanation: '应付账款附有现金折扣的，应按照扣除现金折扣前的应付款总额入账。实际获得现金折扣时，冲减财务费用。', difficulty: 'medium' },

  // ch-01-04 所有者权益
  { id: generateQuestionId('ch-01-04', 1), chapterId: 'ch-01-04', knowledgePoint: '实收资本', type: 'single', content: '企业接受投资者以非现金资产投资时，应按（ ）入账。', options: ['A. 投资方账面价值', 'B. 评估价值', 'C. 投资合同或协议约定的价值', 'D. 公允价值'], answer: 'C', explanation: '企业接受投资者以非现金资产投资时，应按投资合同或协议约定的价值（不公允的除外）确定非现金资产的入账价值和在注册资本中应享有的份额。', difficulty: 'medium' },
  { id: generateQuestionId('ch-01-04', 2), chapterId: 'ch-01-04', knowledgePoint: '资本公积', type: 'single', content: '下列各项中，应计入资本公积的是（ ）。', options: ['A. 发行股票的溢价收入', 'B. 销售商品收入', 'C. 政府补助', 'D. 无法支付的应付账款'], answer: 'A', explanation: '资本公积包括资本（股本）溢价和其他资本公积。发行股票的溢价收入扣除发行费用后计入资本公积——股本溢价。', difficulty: 'easy' },
  { id: generateQuestionId('ch-01-04', 3), chapterId: 'ch-01-04', knowledgePoint: '留存收益', type: 'single', content: '下列各项中，会导致留存收益总额发生增减变动的是（ ）。', options: ['A. 提取法定盈余公积', 'B. 盈余公积补亏', 'C. 宣告分配现金股利', 'D. 资本公积转增资本'], answer: 'C', explanation: '宣告分配现金股利会减少未分配利润，从而导致留存收益总额减少。提取法定盈余公积和盈余公积补亏属于留存收益内部变动，不影响总额。', difficulty: 'medium' },

  // ch-01-05 收入费用利润
  { id: generateQuestionId('ch-01-05', 1), chapterId: 'ch-01-05', knowledgePoint: '收入确认', type: 'single', content: '下列各项中，属于企业收入的是（ ）。', options: ['A. 出售固定资产净收益', 'B. 销售商品收入', 'C. 接受捐赠收入', 'D. 罚款收入'], answer: 'B', explanation: '收入是指企业在日常活动中形成的、会导致所有者权益增加的、与所有者投入资本无关的经济利益的总流入。出售固定资产、接受捐赠和罚款收入属于利得，不属于收入。', difficulty: 'easy' },
  { id: generateQuestionId('ch-01-05', 2), chapterId: 'ch-01-05', knowledgePoint: '费用', type: 'judge', content: '企业发生的公益性捐赠支出应当计入营业外支出。', options: ['A. 正确', 'B. 错误'], answer: 'A', explanation: '公益性捐赠支出与企业日常活动无直接关系，属于非日常活动产生的损失，应计入营业外支出。', difficulty: 'easy' },
  { id: generateQuestionId('ch-01-05', 3), chapterId: 'ch-01-05', knowledgePoint: '利润', type: 'single', content: '某企业2024年度营业收入2000万元，营业成本1200万元，税金及附加50万元，销售费用100万元，管理费用80万元，财务费用20万元，投资收益30万元，营业外收入10万元，营业外支出5万元。该企业的营业利润为（ ）万元。', options: ['A. 580', 'B. 585', 'C. 590', 'D. 595'], answer: 'A', explanation: '营业利润=营业收入-营业成本-税金及附加-销售费用-管理费用-财务费用+投资收益=2000-1200-50-100-80-20+30=580万元。营业外收支不影响营业利润。', difficulty: 'hard' },

  // ch-01-06 财务报表
  { id: generateQuestionId('ch-01-06', 1), chapterId: 'ch-01-06', knowledgePoint: '资产负债表', type: 'single', content: '下列资产负债表项目中，根据总账科目余额直接填列的是（ ）。', options: ['A. 货币资金', 'B. 短期借款', 'C. 应收账款', 'D. 存货'], answer: 'B', explanation: '短期借款根据总账科目余额直接填列。货币资金根据多个科目余额合计填列，应收账款根据有关科目余额减去备抵科目余额后的净额填列，存货根据多个科目计算填列。', difficulty: 'medium' },
  { id: generateQuestionId('ch-01-06', 2), chapterId: 'ch-01-06', knowledgePoint: '利润表', type: 'single', content: '下列各项中，属于利润表"营业成本"项目填列依据的是（ ）。', options: ['A. "主营业务成本"科目的发生额', 'B. "其他业务成本"科目的发生额', 'C. "生产成本"科目的发生额', 'D. "主营业务成本"和"其他业务成本"科目的发生额合计'], answer: 'D', explanation: '利润表"营业成本"项目应根据"主营业务成本"和"其他业务成本"科目的发生额合计填列。', difficulty: 'easy' },

  // ch-02-01 总论
  { id: generateQuestionId('ch-02-01', 1), chapterId: 'ch-02-01', knowledgePoint: '法律关系', type: 'single', content: '经济法律关系的构成要素包括（ ）。', options: ['A. 主体、客体和内容', 'B. 主体、对象和内容', 'C. 当事人、标的和权利义务', 'D. 当事人、行为和法律责任'], answer: 'A', explanation: '经济法律关系由主体、内容和客体三个要素构成。主体是经济法律关系的参加者、当事人，内容是经济法律关系主体享有的权利和承担的义务，客体是权利义务指向的对象。', difficulty: 'easy' },
  { id: generateQuestionId('ch-02-01', 2), chapterId: 'ch-02-01', knowledgePoint: '法律事实', type: 'single', content: '下列各项中，属于法律事件的是（ ）。', options: ['A. 签订合同', 'B. 地震', 'C. 发行股票', 'D. 侵权行为'], answer: 'B', explanation: '法律事件是指不以当事人的主观意志为转移的，能够引起法律关系发生、变更和消灭的客观情况。地震等自然灾害属于法律事件。签订合同、发行股票和侵权行为属于法律行为。', difficulty: 'medium' },

  // ch-02-02 劳动合同
  { id: generateQuestionId('ch-02-02', 1), chapterId: 'ch-02-02', knowledgePoint: '劳动合同订立', type: 'single', content: '用人单位自用工之日起超过1个月不满1年未与劳动者订立书面劳动合同的，应当向劳动者每月支付（ ）的工资。', options: ['A. 1倍', 'B. 1.5倍', 'C. 2倍', 'D. 3倍'], answer: 'C', explanation: '用人单位自用工之日起超过1个月不满1年未与劳动者订立书面劳动合同的，应当向劳动者每月支付2倍的工资。', difficulty: 'easy' },
  { id: generateQuestionId('ch-02-02', 2), chapterId: 'ch-02-02', knowledgePoint: '劳动合同解除', type: 'single', content: '劳动者提前（ ）日以书面形式通知用人单位，可以解除劳动合同。', options: ['A. 15', 'B. 20', 'C. 30', 'D. 60'], answer: 'C', explanation: '劳动者提前30日以书面形式通知用人单位，可以解除劳动合同。劳动者在试用期内提前3日通知用人单位，可以解除劳动合同。', difficulty: 'easy' },

  // ch-02-03 支付结算
  { id: generateQuestionId('ch-02-03', 1), chapterId: 'ch-02-03', knowledgePoint: '票据', type: 'single', content: '下列票据中，付款人不是银行的是（ ）。', options: ['A. 银行汇票', 'B. 银行本票', 'C. 商业承兑汇票', 'D. 支票'], answer: 'C', explanation: '商业承兑汇票由银行以外的付款人承兑，其付款人是承兑人（企业）。银行汇票、银行本票和支票的付款人均为银行。', difficulty: 'medium' },
  { id: generateQuestionId('ch-02-03', 2), chapterId: 'ch-02-03', knowledgePoint: '票据', type: 'judge', content: '支票的提示付款期限为自出票日起10日。', options: ['A. 正确', 'B. 错误'], answer: 'A', explanation: '支票的提示付款期限为自出票日起10日，超过提示付款期限的，付款人可以不予付款。', difficulty: 'easy' },

  // ch-02-04 增值税
  { id: generateQuestionId('ch-02-04', 1), chapterId: 'ch-02-04', knowledgePoint: '增值税计算', type: 'single', content: '某增值税一般纳税人2024年5月销售货物取得不含税销售额100万元，当月购进原材料取得增值税专用发票注明税额10万元。该纳税人5月应纳增值税为（ ）万元。', options: ['A. 3', 'B. 7', 'C. 13', 'D. 17'], answer: 'B', explanation: '应纳税额=当期销项税额-当期进项税额=100×13%-10=13-10=3万元。', difficulty: 'medium' },
  { id: generateQuestionId('ch-02-04', 2), chapterId: 'ch-02-04', knowledgePoint: '增值税税率', type: 'single', content: '增值税一般纳税人销售货物的基本税率为（ ）。', options: ['A. 6%', 'B. 9%', 'C. 13%', 'D. 17%'], answer: 'C', explanation: '增值税一般纳税人销售货物、劳务、有形动产租赁服务或者进口货物，适用13%的基本税率。', difficulty: 'easy' },

  // ch-02-05 企业所得税
  { id: generateQuestionId('ch-02-05', 1), chapterId: 'ch-02-05', knowledgePoint: '应纳税所得额', type: 'single', content: '在计算企业所得税应纳税所得额时，下列支出中不得扣除的是（ ）。', options: ['A. 合理的工资薪金支出', 'B. 企业发生的公益性捐赠支出', 'C. 税收滞纳金', 'D. 财产保险费'], answer: 'C', explanation: '税收滞纳金在计算应纳税所得额时不得扣除。合理的工资薪金、限额内的公益性捐赠支出和财产保险费均可以扣除。', difficulty: 'medium' },
  { id: generateQuestionId('ch-02-05', 2), chapterId: 'ch-02-05', knowledgePoint: '税收优惠', type: 'single', content: '国家需要重点扶持的高新技术企业，减按（ ）的税率征收企业所得税。', options: ['A. 10%', 'B. 15%', 'C. 20%', 'D. 25%'], answer: 'B', explanation: '国家需要重点扶持的高新技术企业，减按15%的税率征收企业所得税。', difficulty: 'easy' },

  // ch-03-01 财务管理总论
  { id: generateQuestionId('ch-03-01', 1), chapterId: 'ch-03-01', knowledgePoint: '财务管理目标', type: 'single', content: '下列各项中，属于股东财富最大化目标优点的是（ ）。', options: ['A. 考虑了资金时间价值', 'B. 便于量化考核', 'C. 考虑了风险因素', 'D. 以上都是'], answer: 'D', explanation: '股东财富最大化目标的优点包括：考虑了资金时间价值、考虑了风险因素、便于量化考核、有利于克服企业追求短期利润的行为。', difficulty: 'easy' },
  { id: generateQuestionId('ch-03-01', 2), chapterId: 'ch-03-01', knowledgePoint: '财务关系', type: 'judge', content: '企业与税务机关之间的财务关系属于企业与政府之间的财务关系。', options: ['A. 正确', 'B. 错误'], answer: 'A', explanation: '企业与税务机关之间的关系体现为依法纳税的关系，属于企业与政府之间的财务关系。', difficulty: 'easy' },

  // ch-03-02 财务管理基础
  { id: generateQuestionId('ch-03-02', 1), chapterId: 'ch-03-02', knowledgePoint: '资金时间价值', type: 'single', content: '某人将10000元存入银行，年利率为4%，按复利计算，3年后的本利和为（ ）元。（(F/P,4%,3)=1.1249）', options: ['A. 11200', 'B. 11249', 'C. 11600', 'D. 12400'], answer: 'B', explanation: '复利终值F=P×(F/P,i,n)=10000×1.1249=11249元。', difficulty: 'medium' },
  { id: generateQuestionId('ch-03-02', 2), chapterId: 'ch-03-02', knowledgePoint: '风险与收益', type: 'single', content: '下列各项中，属于系统风险的是（ ）。', options: ['A. 公司经营决策失误', 'B. 公司工人罢工', 'C. 通货膨胀', 'D. 新产品开发失败'], answer: 'C', explanation: '系统风险（不可分散风险）是指影响所有公司的因素引起的风险，如通货膨胀、经济衰退、战争等。公司经营决策失误、工人罢工和新产品开发失败属于非系统风险。', difficulty: 'medium' },
  { id: generateQuestionId('ch-03-02', 3), chapterId: 'ch-03-02', knowledgePoint: '年金', type: 'single', content: '每年年末存入银行10000元，年利率5%，5年后的年金终值为（ ）元。（(F/A,5%,5)=5.5256）', options: ['A. 50000', 'B. 52500', 'C. 55256', 'D. 58019'], answer: 'C', explanation: '普通年金终值F=A×(F/A,i,n)=10000×5.5256=55256元。', difficulty: 'medium' },

  // ch-03-03 预算管理
  { id: generateQuestionId('ch-03-03', 1), chapterId: 'ch-03-03', knowledgePoint: '预算编制方法', type: 'single', content: '以零为基础编制预算，不考虑以往期间的费用项目和费用数额的预算编制方法是（ ）。', options: ['A. 固定预算', 'B. 弹性预算', 'C. 增量预算', 'D. 零基预算'], answer: 'D', explanation: '零基预算是以零为基础编制预算，不考虑以往期间的费用项目和费用数额，从根本上研究分析每项预算是否有支出的必要性和支出数额的大小。', difficulty: 'easy' },
  { id: generateQuestionId('ch-03-03', 2), chapterId: 'ch-03-03', knowledgePoint: '预算分类', type: 'judge', content: '财务预算是指企业在计划期内反映有关预计现金收支、财务状况和经营成果的预算，主要包括现金预算、预计利润表和预计资产负债表。', options: ['A. 正确', 'B. 错误'], answer: 'A', explanation: '财务预算是指企业在计划期内反映有关预计现金收支、财务状况和经营成果的预算，主要包括现金预算、预计利润表和预计资产负债表。', difficulty: 'easy' },

  // ch-03-04 筹资管理
  { id: generateQuestionId('ch-03-04', 1), chapterId: 'ch-03-04', knowledgePoint: '筹资方式', type: 'single', content: '下列筹资方式中，属于直接筹资的是（ ）。', options: ['A. 发行股票', 'B. 银行借款', 'C. 融资租赁', 'D. 商业信用'], answer: 'A', explanation: '直接筹资是企业直接与资金供应者协商融通资本的一种筹资活动，如发行股票、发行债券等。银行借款、融资租赁和商业信用属于间接筹资。', difficulty: 'medium' },
  { id: generateQuestionId('ch-03-04', 2), chapterId: 'ch-03-04', knowledgePoint: '资本成本', type: 'single', content: '某公司拟发行面值1000元、票面利率8%、期限5年的债券，每年付息一次，发行价格950元，发行费用率2%，所得税税率25%。该债券的资本成本约为（ ）。', options: ['A. 5.8%', 'B. 6.4%', 'C. 6.8%', 'D. 8.4%'], answer: 'B', explanation: '债券资本成本=年利息×(1-所得税税率)/[筹资额×(1-筹资费用率)]=1000×8%×(1-25%)/[950×(1-2%)]≈6.44%。', difficulty: 'hard' },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-01',
    teacherId: 'teacher-01',
    title: '关于本周模拟考试的通知',
    content: '各位同学好！本周六（6月14日）上午9:00-11:00将进行第一次全真模拟考试，考试范围为《初级会计实务》第1-4章，请各位同学提前做好准备，准时参加。考试结束后系统将自动评分并生成成绩分析报告。',
    createdAt: '2026-06-10T09:00:00Z',
  },
  {
    id: 'ann-02',
    teacherId: 'teacher-01',
    title: '学习方法建议',
    content: '最近查看了大家的练习数据，建议同学们注意以下几点：\n1. 每学完一章立即做题巩固，不要等全部学完再统一刷题\n2. 错题本要定期回顾，建议每周至少回顾一次\n3. 利用好计划页的复习提醒功能，按遗忘曲线科学复习\n4. 有疑问随时在学习群提出',
    createdAt: '2026-06-08T14:30:00Z',
  },
  {
    id: 'ann-03',
    teacherId: 'teacher-01',
    title: '下周一新课程上线预告',
    content: '《经济法基础》第三章"支付结算法律制度"的课程视频将于下周一（6月16日）上线，届时配套练习题也将同步开放。请同学们合理安排时间，在完成当前章节学习后及时跟进。',
    createdAt: '2026-06-11T10:00:00Z',
  },
];