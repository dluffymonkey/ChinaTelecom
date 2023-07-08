const w = new ListWidget()
const DynamicText = Color.dynamic(new Color('#111111'), new Color('#ffffff'))
w.backgroundColor = Color.dynamic(new Color('#ffffff'), new Color('#1c1c1e'))


!(async () => {
  let Wsize = -1
  if (!getdata('LimitVal')) setdata('LimitVal', '')
  if (!getdata('unLimitVal')) setdata('unLimitVal', '')

  if (config.runsInApp) {
    let al = new Alert()
    al.title = '余量信息'
    al.message = '请在相关设置选择数据来源哈'
    al.addAction('更新脚本') //0
    al.addAction('相关设置') //1
    al.addAction('预览组件') //2
    al.addAction('刷新桌面小组件') //3
    al.addCancelAction('取消') //-1


    let UserCh = await al.presentSheet()
    if (UserCh == -1) { }
    if (UserCh == 0) {
      await AsyncJs()
      let al = new Alert()
      al.message = '更新脚本完成，退出后生效'
      al.addAction('完成')
      await al.present()
    }
    if (UserCh == 1) {//相关设置
      let a1 = new Alert()
      a1.title = '相关设置'
      a1.message = '间距与数据相关设置'
      a1.addAction('数据来源')
      a1.addAction('自定义余量')
      a1.addAction('组件间距设置')
      a1.addDestructiveAction('清除缓存')
      a1.addCancelAction('取消')
      let ch = await a1.presentAlert()
      if (ch == 0) {//数据来源
        let a2 = new Alert()
        a2.title = '数据来源'
        a2.addAction('从BoxJS获取-电信')
        a2.addAction('从BoxJS获取-联通')
        a2.addCancelAction('取消')
        let ch = await a2.presentAlert()
        if (ch == -1) { }
        if (ch == 0) {
          setdata('isData', '1')
          Wsize = 1
        }
        if (ch == 1) {
          setdata('isData', '2')
          Wsize = 1
        }

      }
      if (ch == 1) {//通用与定向数据自定义
        let a2 = new Alert()
        a2.message = `通用与定向数据自定义\n不填写为默认空\n单位GB`
        a2.addTextField('通用总量', getdata('LimitVal') || '')
        a2.addTextField('定向总量', getdata('unLimitVal') || '')
        a2.addAction('确认')
        a2.addCancelAction('取消')
        await a2.presentAlert()
        let val = a2.textFieldValue(0)
        let val1 = a2.textFieldValue(1)
        setdata('LimitVal', String(val))
        setdata('unLimitVal', String(val1))

      }
      if (ch == 2) {//组件间距设置
        let a2 = new Alert()
        a2.title = '组件间距设置'
        a2.message = `柱状图单次减少量为0.1`
        a2.addTextField('组件间隔 默认值50', getdata('Space') || '')
        a2.addTextField('柱状图间隔 默认值2', getdata('KSize') || '')
        a2.addTextField('左边距 默认值5', getdata('Left_Padding') || '')
        a2.addDestructiveAction('全部恢复默认值')
        a2.addAction('确认')
        a2.addCancelAction('取消')
        let ch = await a2.presentAlert()
        if (ch == 0) {
          rmdata('Space');
          rmdata('KSize');
          rmdata('Left_Padding');
        } else if (ch == 1) {
          let Space = a2.textFieldValue(0)
          let KSize = a2.textFieldValue(1)
          let Left_Padding = a2.textFieldValue(2)
          setdata('Space', String(Space))
          setdata('KSize', String(KSize))
          setdata('Left_Padding', String(Left_Padding))
          Wsize = 1
        }

      }
      if (ch == 3) {
        let a2 = new Alert()
        a2.message = `清除上版本缓存，当组件存在问题时可清理`
        a2.addAction('确认')
        a2.addCancelAction('取消')
        let ch = await a2.presentAlert()
        if (ch == 0) { for (i = 0; i < 48; ++i)rmdata(String(i)) }
      }
    }
    if (UserCh == 2) {//预览类型
      let a1 = new Alert()
      a1.title = '预览类型'
      a1.addAction('小组件')
      a1.addAction('中等组件')
      a1.addCancelAction('取消')
      Wsize = await a1.presentAlert()
    }
    if (UserCh == 3) {
      let al = new Alert()
      al.message = '刷新完成'
      al.addAction('完成')
      await al.present()
    }
  }

  let str = '数据流量-通用'
  let str1 = '话费账单-使用'
  Query = await BoxJsData()

  processData(Query)

  if (config.widgetFamily == 'small' || Wsize == 0) {
    generateSmallWidget(str, str1, w, Query)
    if (Wsize == 0) { w.presentSmall() }
  }
  if (config.widgetFamily == 'medium' || Wsize == 1) {

    const rowSpacing = 10; // 设置行间距
    const leftPadding = Number(getdata('Left_Padding')) || 5; // 设置左边距
    const LimtUnlimitPadding = Number(getdata('Space')) || 50; //设置第一行通用与定向间距

    generateMediumWidget(Query, str, str1, w, rowSpacing, leftPadding, LimtUnlimitPadding)
    if (Wsize == 1) { w.presentMedium() }
  }
  Script.setWidget(w)
  Script.complete()

})()

async function AsyncJs () {
  let fm = FileManager.local();
  if (fm.isFileStoredIniCloud(module.filename)) {
    fm = FileManager.iCloud();
  }
  const url = 'http://192.168.31.252:5500/ChinaTelecom/Tele_Cellular_Auto.js';
  const request = new Request(url);
  try {
    const code = await request.loadString();
    fm.writeString(module.filename, code);
    const alert = new Alert();
    alert.message = '代码已更新,关闭生效。';
    // alert.addAction('确定');
    // alert.presentAlert();
  } catch (e) {
    console.error(e);
  }
}

function processData (Query) {
  let Hours = new Date().getHours(); //获取小时	
  if (!getdata('Hours')) setdata('Hours', String(Hours));
  LastTime = Hours == 0 ? 47 : Hours + 24 - 1;

  for (Hours == 0 ? i = 1 : i = 0; i <= 23 && (!getdata(String(i)) || Hours == 0); i++) { //数据初始化
    let First = { unlimitchange: 0, limitchange: 0 };
    setdata(String(i), JSON.stringify(First));
  }
  for (i = 24; i <= 47 && !getdata(String(i)); i++) { //数据初始化	
    let First = { unlimitusage: 0, limitusage: 0 };
    setdata(String(i), JSON.stringify(First));
  }

  if (getdata('Hours') != String(Hours)) {
    setdata('Hours', String(Hours));
    let Usage = {
      limitusage: Query.LimitUsage,
      unlimitusage: Query.UNLimitUsage
    }
    setdata(String(Hours + 24), JSON.stringify(Usage)); //将就数据存入24-47中	
  }

  let LastLimit = getobjdata(String(LastTime)).limitusage;
  let LastUnlimit = getobjdata(String(LastTime)).unlimitusage;
  let Change = {
    unlimitchange: Query.UNLimitUsage - LastUnlimit,
    limitchange: Query.LimitUsage - LastLimit
  };
  setdata(String(Hours), JSON.stringify(Change)); //将变化量存入0~23中
}

function generateSmallWidget (str, str1, Widget, Query) {
  const container = Widget.addStack();
  container.layoutVertically();
  container.centerAlignContent();

  const upStack = container.addStack();
  generateModule(upStack, str, Query.LimitUsage, Query.LimitAll, '1')
  container.addSpacer(10);
  const downStack = container.addStack();
  generateModule(downStack, str1, Query.VoiceDataBill.used, Query.VoiceDataBill.left, '2')
}

function generateModule (Widget, str, usage, total, type) {

  Widget.setPadding(0, 0, 0, 25);

  const column = Widget.addStack()
  column.layoutVertically()

  let titleRow = column.addStack()
  titleRow.layoutHorizontally()
  let title = titleRow.addText(str)
  title.textColor = DynamicText
  title.font = Font.boldSystemFont(9)

  column.addSpacer(2)

  let valRow = column.addStack()
  // valRow.layoutHorizontally()
  const iconImg = valRow.addImage(UsageBar(usage, total))
  iconImg.imageSize = new Size(7, 45)
  valRow.addSpacer(5)//图片与文字距离
  let valRowLine = valRow.addStack()
  valRowLine.layoutVertically()
  if (type == '1') {
    const usageText = valRowLine.addText(String(ToSize(usage, 1, 1, 1)))
    const totalText = valRowLine.addText(String(ToSize(total, 1, 0, 1)) + '(' + (usage / total * 100).toFixed(0) + '%)')
    usageText.font = Font.mediumMonospacedSystemFont(20)
    totalText.font = Font.mediumRoundedSystemFont(15)
    usageText.textColor = DynamicText
    totalText.textColor = DynamicText
  }
  if (type == '2') {
    const usageText = valRowLine.addText(usage)
    const totalText = valRowLine.addText(total + '元')
    usageText.font = Font.mediumMonospacedSystemFont(20)
    totalText.font = Font.mediumRoundedSystemFont(15)
    usageText.textColor = DynamicText
    totalText.textColor = DynamicText
  }

}

function generateMediumWidget (Query, str, str1, Widget, rowSpacing, leftPadding, LimtUnlimitPadding) {

  let column = Widget.addStack()
  column.layoutVertically()


  let row = column.addStack();
  row.addSpacer(leftPadding + 10)

  column.addSpacer(rowSpacing); // 在 row2 添加垂直间距

  let row2 = column.addStack()
  row2.addSpacer(leftPadding)

  column.addSpacer(rowSpacing); // 在 row3 添加垂直间距

  let row3 = column.addStack()
  row3.addSpacer(leftPadding)

  const container = row.addStack();
  container.layoutHorizontally();
  container.centerAlignContent();

  const leftStack = container.addStack();
  generateModule(leftStack, str, Query.LimitUsage, Query.LimitAll)

  container.addSpacer(LimtUnlimitPadding);

  const rightStack = container.addStack();
  generateModule(rightStack, str1, Query.UNLimitUsage, Query.UNLimitAll)


  const canvasWidth = 10;
  const canvasHeight = 40;

  for (let i = 0; i <= 23; i++) {
    let columnImgStack = row3.addStack()
    columnImgStack.layoutVertically()
    const iconImg = columnImgStack.addImage(HourKline(getobjdata(String(i)).limitchange, getobjdata(String(i)).unlimitchange, i, canvasWidth, canvasHeight))
    iconImg.imageSize = new Size(canvasWidth, canvasHeight);
    // 在指定时间下方绘制时间数字
    if (i === 0 || i === 6 || i === 12 || i === 18 || i === 23) {
      let timeText = columnImgStack.addText(i.toString().padStart(2, '0'))
      timeText.font = Font.mediumSystemFont(9)
      timeText.textColor = DynamicText
    }
    row3.addSpacer(Number(getdata('KSize')) || 2);
  }


}


/**
 * 
 * @param {*} total 总量
 * @param {*} haveGone 使用量
 * @returns 
 */
function UsageBar (haveGone, total) {
  const canvasWidth = 7;
  const canvasHeight = 40;
  const barCornerRadius = { x: 8, y: 2 };

  // 创建DrawContext实例，并设置画布大小
  const context = new DrawContext();
  context.size = new Size(canvasWidth, canvasHeight)//画布宽高
  context.respectScreenScale = true;
  context.opaque = false; // 设置为透明背景

  // 创建柱状图剩余路径
  const bgPath = new Path();
  bgPath.addRoundedRect(new Rect(0, 0, canvasWidth, canvasHeight), barCornerRadius.x, barCornerRadius.y);
  context.addPath(bgPath);
  context.setFillColor(new Color("#4d4d4d"));
  context.fillPath();

  // 创建柱状图用量路径
  const barPath = new Path();
  let barHeight = 0
  console.log(parseFloat(haveGone))
  console.log(parseFloat(total))
  if (parseFloat(haveGone) > 0 || parseFloat(total) > 0) {
    barHeight = (parseFloat(haveGone) / parseFloat(total)) * canvasHeight;
  }
  console.log(barHeight)
  const barRect = new Rect(0, canvasHeight - barHeight, canvasWidth, barHeight);
  barPath.addRoundedRect(barRect, barCornerRadius.x, barCornerRadius.y);
  context.addPath(barPath);
  context.setFillColor(new Color("#1785ff")); // 填充蓝色
  context.fillPath();

  const Image = context.getImage(); // 获取绘制的图像

  return Image;
}

/**
 * 
 * @param {*} limit 通用用量
 * @param {*} unlimit 定向用量
 * @param {*} t 时间
 * @returns image
 */
function HourKline (limit, unlimit, t, width, height) {

  let All = limit + unlimit

  if (All >= 0 && All <= 10240) ThereShold = 10240//10MB
  if (All > 10240 && All <= 102400) ThereShold = 102400//100MB
  if (All > 102400 && All <= 512000) ThereShold = 512000//500MB
  if (All > 512000 && All <= 1048576) ThereShold = 1048576//1GB
  if (All > 1048576 && All <= 5242880) ThereShold = 5242880//5GB
  if (All > 5242880 && All <= 20971520) ThereShold = 20971520//20GB
  if (All > 20971520) ThereShold = 1048576000//100GB

  const context = new DrawContext()//创建图形画布
  context.opaque = false; // 设置为透明背景
  context.size = new Size(width, height)
  context.respectScreenScale = true

  if (t == 0 || t == 6 || t == 12 || t == 18 || t == 23) Width = 0.4
  else Width = 0.1

  const bgColor = new Color("#4d4d4d"); // 线条为浅灰色
  // 创建柱状图线条
  const bgPath = new Path();
  bgPath.addRoundedRect(new Rect(width / 2, 0, Width, height), 0, 0);
  context.addPath(bgPath);
  context.setFillColor(bgColor);
  context.fillPath();


  // 创建柱状图用量路径
  const barPath = new Path();
  const limitbarHeight = height * limit / ThereShold
  const unlimitbarHeight = height * unlimit / ThereShold

  const barlimitRect = new Rect(0, height - limitbarHeight - unlimitbarHeight, width, limitbarHeight);
  const barunlimitRect = new Rect(0, height - unlimitbarHeight, width, unlimitbarHeight);
  barPath.addRoundedRect(barlimitRect, 0, 0);
  barPath.addRoundedRect(barunlimitRect, 0, 0);

  // 设置不同的填充颜色
  context.setFillColor(new Color("#fe708b")); // 设置limit部分的填充颜色
  context.fill(barlimitRect);

  context.setFillColor(new Color("#8676ff")); // 设置unlimit部分的填充颜色
  context.fill(barunlimitRect);
  return context.getImage()
}

function ToSize (kbyte, s, l, t) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  let size = kbyte * 1024; // 将输入的千字节转换为字节

  // 计算单位的指数
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // 格式化大小字符串
  let formattedSize = size.toFixed(s);
  if (l > 0) {
    formattedSize = formattedSize.padEnd(formattedSize.length + l, ' ');
  }

  // 添加单位
  if (t === 1) {
    formattedSize += units[unitIndex];
  }

  return formattedSize;
}


async function BoxJsData () {
  console.log('BoxJS获取数据')
  let url
  if (getdata('isData') == '1') {
    url = 'http://boxjs.com/query/data/PackgeDetail'
  }
  if (getdata('isData') == '2') {
    url = 'http://boxjs.com/query/data/@ChinaUnicom.10010v4.vars'
  }
  console.log(url)

  let data = null
  try {
    let SetVal = Number(getdata('LimitVal'))
    let SetVal1 = Number(getdata('unLimitVal'))

    let req = new Request(url)
    data = await (req.loadJSON())

    if (getdata('isData') == '1') {

      if (SetVal != '') SetVal *= 1048576
      if (SetVal1 != '') SetVal1 *= 1048579

      ArrayQuery = JSON.parse(data.val)

      BillLeft = ArrayQuery.balanceInfo.balance || null,//[话剩]
        BillUsed = ArrayQuery.balanceInfo.used || null,//[话用]
        AllLimitUse = ArrayQuery.flowInfo.commonFlow.used,// '[通用]'
        AllLimitLeft = ArrayQuery.flowInfo.commonFlow.balance,// '[通剩]'
        AllLimit = ArrayQuery.flowInfo.commonFlow.total || SetVal,// '[通总]'
        AllUnlimitUse = ArrayQuery.flowInfo.specialAmount.used,// '[定用]'
        AllUnlimitLeft = ArrayQuery.flowInfo.specialAmount.balance,// '[定剩]'
        AllUnlimit = ArrayQuery.flowInfo.specialAmount.total || SetVal1,// '[定总]'
        AllVoiceUsed = ArrayQuery.voiceInfo.used || null,//[语用]
        AllVoiceLeft = ArrayQuery.voiceInfo.balance || null//[语剩]


    }
    if (getdata('isData') == '2') {
      rawData = JSON.parse(data.val)

      AllUnlimit = SetVal1 * 1048579
      AllUnlimitUse = (rawData['[所有免流.已用].raw']) * 1024
      AllUnlimitLeft = AllUnlimit - AllUnlimitUse

      AllLimit = SetVal * 1048576
      AllLimitUse = (rawData['[所有通用.已用].raw']) * 1024
      limitbalancetotal = AllLimit - AllLimitUse
      PhoneBill = ''
      DataBill = ''

    }
  } catch (e) {
    console.error(e);
  }

  let Queryinfo = {
    UNLimitAll: AllUnlimit,
    UNLimitLeft: AllUnlimitLeft,
    UNLimitUsage: AllUnlimitUse,

    LimitAll: AllLimit,
    LimitLeft: AllLimitLeft,
    LimitUsage: AllLimitUse,

    VoiceBill: { used: AllVoiceUsed, left: AllVoiceLeft },
    VoiceDataBill: { used: BillUsed, left: BillLeft }
  }
  console.log(Queryinfo)
  return Queryinfo
}

async function getImage (url) {
  const request = new Request(url);
  const image = await request.loadImage();
  return image
}

function setdata (Key, Val) { Keychain.set(Key, Val); }
function getdata (Key) {
  if (Keychain.contains(Key)) return Keychain.get(Key)
  else return false
}
function getobjdata (Key) { return JSON.parse(Keychain.get(Key)) }
function rmdata (Key) { Keychain.remove(Key) }
