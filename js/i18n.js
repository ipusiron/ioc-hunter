// 日本語と英語の文言。UI側のスクリプトは言語ごとの文字列を持たない。
// IoCの種別名（IP address / domain / URL / hash / CVE など）と defang 表記は
// 英語圏で通用する綴りをそのまま使い、訳語を当てない。
const I18n = (() => {
  const ja = {
    'app.title': 'IOCハンター（IOC Hunter）— ログから侵害の痕跡を自動検出・可視化',
    'app.description': 'ログやテキストからIOC（侵害の痕跡）を抽出し、12種類を色分けして可視化するブラウザー完結のツール。',
    'app.heading': '🕵️ IOCハンター（IOC Hunter）',
    'app.langButton': 'English',
    'app.langAria': '言語を切り替える',
    'help.open': 'ヘルプを表示',
    'help.close': 'ヘルプを閉じる',
    'header.darkToggle': 'ダークモード切り替え',

    'drop.text': 'ここに .txt ファイルをドロップするか、',
    'drop.choose': 'ファイルを選択',
    'test.useLog': 'テストログを使う',
    'test.label': 'テストログ',
    'test.placeholder': 'テスト用ログファイルを選択してください',
    'test.load': '読み込む',

    'input.label': '解析するログ・テキスト',
    'input.placeholder': 'ここにログやテキストを貼り付けてください...',
    'input.analyze': '解析する',

    'whitelist.heading': '⚪ ホワイトリスト設定',
    'whitelist.inputLabel': '除外するIOC',
    'whitelist.inputPlaceholder': '除外するIOCを入力（例: 192.168.1.1）',
    'whitelist.add': '追加',
    'whitelist.enable': 'ホワイトリストを有効にする',
    'whitelist.empty': 'ホワイトリストは空です',
    'whitelist.remove': '{value} を除外リストから外す',

    'results.heading': '🔍 抽出結果',
    'status.done': '解析が完了しました。',
    'export.formatLabel': '出力形式',
    'export.json': 'JSON形式',
    'export.csv': 'CSV形式',
    'export.txt': 'テキスト形式',
    'export.defang': 'defangして出力',
    'export.download': '📥 結果をダウンロード',

    'tabs.aria': '解析結果',
    'tab.overview': '📊 概要',
    'tab.analysis': '🔬 分析',
    'tab.timeline': '📅 タイムライン',
    'tab.details': '📝 詳細',
    'panel.overview': '📊 IOC統計',
    'panel.analysis': '🔬 関連性分析',
    'panel.timeline': '📅 タイムライン分析',
    'panel.details': '📝 抽出結果',

    'stats.item': '{total} 件（ユニーク: {unique} 件）',
    'stats.filtered': '（{filtered} 件除外）',
    'chart.total': '総数',
    'chart.unique': 'ユニーク',

    'analysis.empty': '関連性のあるIOCは検出されませんでした。',
    'analysis.limit': '上限に達したため一部のみ表示しています。',
    'analysis.found': '検出された関連性',
    'timeline.empty': 'タイムスタンプ付きのIOCは検出されませんでした。',
    'timeline.groups': '時間グループ',
    'timeline.events': '{count} 件',
    'timeline.line': '行 {line}',
    'correlation.cooccurrence': '共起関係',
    'correlation.domainIp': 'ドメイン-IP関連',
    'correlation.fileHash': 'ファイル-ハッシュ関連',
    'correlation.threatIntel': 'CVE-MITRE関連',
    'correlation.context': '行 {line}: {context}',
    'correlation.proximity': '行 {line}: 距離 {proximity}文字',

    'detail.summary': '📈 サマリー',
    'detail.totalIocs': '総IOC数',
    'detail.uniqueIocs': 'ユニークIOC数',
    'detail.detectedTypes': '検出タイプ数',
    'detail.dominantType': '優勢タイプ',
    'detail.riskLevel': 'リスクレベル',
    'detail.none': 'なし',
    'detail.distribution': '📊 分布分析',
    'detail.duplicateRate': '重複率: {rate}%',
    'detail.patterns': '🔄 繰り返しパターン',
    'detail.count': '{count}回',
    'detail.risks': '⚠️ リスク評価',
    'risk.highRiskIoc': '{type}タイプのIOCが検出されました',
    'pattern.multipleIps': '多数のIPアドレスが検出されました（ポートスキャンの可能性）',

    'error.fileTooLarge': '⚠ このファイルは20MBを超えているため読み込めません。',
    'error.invalidFileType': 'テキストファイル（.txt または .log）を選択してください。',
    'error.noSample': '読み込むテストログを選択してください。',
    'error.sampleLoad': 'ファイル読み込みに失敗しました: {filename}',
    'error.invalidSampleName': '無効なサンプル名です。',
    'error.sampleList': 'サンプル一覧を読み込めませんでした。',
    'error.fileRead': 'ファイルの読み込みに失敗しました',
    'error.emptyInput': '分析するテキストを入力してください。',
    'error.correlation': '関連性分析に失敗しました。',
    'error.analyze': '分析中にエラーが発生しました: {message}',
    'error.duplicateIoc': '無効なIOCまたはすでに追加済みです',
    'error.noExportData': 'エクスポートするデータがありません',
    'error.unsupportedFormat': 'サポートされていない形式です',

    'file.csvHeader.type': 'IOCタイプ',
    'file.csvHeader.value': 'IOC値',
    'file.csvHeader.total': '総数',
    'file.csvHeader.unique': 'ユニーク数',
    'file.csvEmpty': '(なし)',
    'file.txtTitle': 'IOC抽出結果',
    'file.txtDate': '抽出日時',
    'file.txtSummary': 'サマリー',
    'file.txtTotal': '総IOC数',
    'file.txtUnique': 'ユニークIOC数',
    'file.txtTypeTotal': '総数',
    'file.txtTypeUnique': 'ユニーク数',
    'file.txtItems': '検出項目',

    'helpDoc.basicHeading': '📋 基本的な使い方',
    'helpDoc.basic1Label': 'テキスト入力',
    'helpDoc.basic1': 'テキストエリアにログやテキストデータを貼り付け',
    'helpDoc.basic2Label': 'ファイル読み込み',
    'helpDoc.basic2': '.txtや.logファイルをドラッグ&ドロップまたは選択',
    'helpDoc.basic3Label': '解析実行',
    'helpDoc.basic3': '「解析する」ボタンをクリック',
    'helpDoc.basic4Label': '結果確認',
    'helpDoc.basic4': 'IOCがハイライトされ、統計とグラフが表示されます',
    'helpDoc.typesHeading': '🎯 検出できるIOCタイプ',
    'helpDoc.typesNetwork': 'ネットワーク関連',
    'helpDoc.typeDomain': 'ドメイン',
    'helpDoc.typeEmail': 'メール',
    'helpDoc.typesFile': 'ファイル・システム関連',
    'helpDoc.typeFilePath': 'ファイルパス',
    'helpDoc.typeRegistry': 'レジストリキー',
    'helpDoc.typeHash': 'ハッシュ値',
    'helpDoc.typesThreat': '脅威インテリジェンス',
    'helpDoc.typeCve': 'CVE番号',
    'helpDoc.typeFlag': 'CTFフラグ',
    'helpDoc.whitelistHeading': '⚪ ホワイトリスト機能',
    'helpDoc.whitelistLead': '既知の安全なIOCを除外できます。',
    'helpDoc.whitelistAddLabel': '追加',
    'helpDoc.whitelistAdd': 'テキストボックスに入力して「追加」ボタンまたはEnterキー',
    'helpDoc.whitelistRemoveLabel': '削除',
    'helpDoc.whitelistRemove': '各項目の×ボタンをクリック',
    'helpDoc.whitelistDisableLabel': '無効化',
    'helpDoc.whitelistDisable': 'チェックボックスでON/OFF切り替え',
    'helpDoc.whitelistSaveLabel': '自動保存',
    'helpDoc.whitelistSave': '設定は自動的にブラウザーに保存されます',
    'helpDoc.statsHeading': '📊 統計とグラフ',
    'helpDoc.statsCountLabel': '統計表示',
    'helpDoc.statsCount': '各IOCタイプの総数とユニーク数を表示',
    'helpDoc.statsChartLabel': 'グラフ表示',
    'helpDoc.statsChart': '棒グラフで視覚的に確認',
    'helpDoc.statsFilteredLabel': '除外件数',
    'helpDoc.statsFiltered': 'ホワイトリストで除外された件数も表示',
    'helpDoc.statsThemeLabel': 'ダークモード対応',
    'helpDoc.statsTheme': '月アイコンで切り替え可能',
    'helpDoc.exportHeading': '📥 エクスポート機能',
    'helpDoc.exportDefang': '[.]・(.)・{.}、[@]・(@)・[at]、hxxp(s)、[://]・[:]//のdefang表記を検出します。'
      + '画面には原文を表示し、正規形で集計します。'
      + '「defangして出力」でネットワークIOCを無害化表記に戻せます。',
    'helpDoc.exportLead': '解析結果を以下の形式でダウンロードできます。',
    'helpDoc.exportJsonLabel': 'JSON形式',
    'helpDoc.exportJson': 'プログラムで処理しやすい構造化データ',
    'helpDoc.exportCsvLabel': 'CSV形式',
    'helpDoc.exportCsv': 'Excelで開ける表形式（BOM付き）',
    'helpDoc.exportTxtLabel': 'テキスト形式',
    'helpDoc.exportTxt': '読みやすいレポート形式',
    'helpDoc.keysHeading': '⌨️ キーボードショートカット',
    'helpDoc.keyEnter': 'ホワイトリスト入力時に項目を追加',
    'helpDoc.keyEscape': 'このヘルプを閉じる',
    'helpDoc.useHeading': '💡 活用例',
    'helpDoc.useCtfLabel': 'CTF競技',
    'helpDoc.useCtf': 'ログファイルからフラグやヒントを発見',
    'helpDoc.useIrLabel': 'インシデント対応',
    'helpDoc.useIr': '攻撃者のIPやマルウェアハッシュを抽出',
    'helpDoc.useEduLabel': 'セキュリティ教育',
    'helpDoc.useEdu': 'ログ解析の練習教材として',
    'helpDoc.useThreatLabel': '脅威分析',
    'helpDoc.useThreat': 'IOCの収集と前処理',
    'helpDoc.notesHeading': '⚠️ 注意事項',
    'helpDoc.note1': 'ファイルサイズは最大20MBまで',
    'helpDoc.note2': 'すべての処理はブラウザー内で実行（データは外部送信されません）',
    'helpDoc.note3': '正規表現による検出のため、一部誤検出の可能性があります',
    'helpDoc.title': '🕵️ IOCハンター ヘルプ',

    'footer.before': '🔗 GitHubリポジトリーはこちら（',
    'footer.after': '）'
  };

  const en = {
    'app.title': 'IOC Hunter — Automatically detect and visualize Indicators of Compromise',
    'app.description': 'A browser-only tool that extracts IOCs from logs and text, '
      + 'highlighting 12 types with colour coding.',
    'app.heading': '🕵️ IOC Hunter',
    'app.langButton': '日本語',
    'app.langAria': 'Switch language',
    'help.open': 'Show help',
    'help.close': 'Close help',
    'header.darkToggle': 'Toggle dark mode',

    'drop.text': 'Drop a .txt file here, or',
    'drop.choose': 'choose a file',
    'test.useLog': 'Use a test log',
    'test.label': 'Test log',
    'test.placeholder': 'Select a test log file',
    'test.load': 'Load',

    'input.label': 'Log or text to analyse',
    'input.placeholder': 'Paste a log or any text here...',
    'input.analyze': 'Analyse',

    'whitelist.heading': '⚪ Whitelist settings',
    'whitelist.inputLabel': 'IOC to exclude',
    'whitelist.inputPlaceholder': 'Enter an IOC to exclude (e.g. 192.168.1.1)',
    'whitelist.add': 'Add',
    'whitelist.enable': 'Enable the whitelist',
    'whitelist.empty': 'The whitelist is empty',
    'whitelist.remove': 'Remove {value} from the whitelist',

    'results.heading': '🔍 Extracted IOCs',
    'status.done': 'Analysis complete.',
    'export.formatLabel': 'Output format',
    'export.json': 'JSON',
    'export.csv': 'CSV',
    'export.txt': 'Plain text',
    'export.defang': 'Defang the output',
    'export.download': '📥 Download the results',

    'tabs.aria': 'Analysis results',
    'tab.overview': '📊 Overview',
    'tab.analysis': '🔬 Correlation',
    'tab.timeline': '📅 Timeline',
    'tab.details': '📝 Details',
    'panel.overview': '📊 IOC statistics',
    'panel.analysis': '🔬 Correlation analysis',
    'panel.timeline': '📅 Timeline analysis',
    'panel.details': '📝 Extracted IOCs',

    'stats.item': '{total} total ({unique} unique)',
    'stats.filtered': '({filtered} excluded)',
    'chart.total': 'Total',
    'chart.unique': 'Unique',

    'analysis.empty': 'No correlated IOCs were found.',
    'analysis.limit': 'The limit was reached, so only part of the result is shown.',
    'analysis.found': 'Correlations found',
    'timeline.empty': 'No IOCs with a timestamp were found.',
    'timeline.groups': 'Time groups',
    'timeline.events': '{count} events',
    'timeline.line': 'Line {line}',
    'correlation.cooccurrence': 'Co-occurrence',
    'correlation.domainIp': 'Domain-IP',
    'correlation.fileHash': 'File-hash',
    'correlation.threatIntel': 'CVE-MITRE',
    'correlation.context': 'Line {line}: {context}',
    'correlation.proximity': 'Line {line}: {proximity} characters apart',

    'detail.summary': '📈 Summary',
    'detail.totalIocs': 'IOCs found',
    'detail.uniqueIocs': 'Unique IOCs',
    'detail.detectedTypes': 'Types detected',
    'detail.dominantType': 'Dominant type',
    'detail.riskLevel': 'Risk level',
    'detail.none': 'none',
    'detail.distribution': '📊 Distribution',
    'detail.duplicateRate': 'Duplicates: {rate}%',
    'detail.patterns': '🔄 Repeated IOCs',
    'detail.count': '{count}x',
    'detail.risks': '⚠️ Risk assessment',
    'risk.highRiskIoc': 'IOCs of type {type} were found',
    'pattern.multipleIps': 'Many IP addresses were found (a port scan is possible)',

    'error.fileTooLarge': '⚠ This file is larger than 20MB, so it cannot be loaded.',
    'error.invalidFileType': 'Select a text file (.txt or .log).',
    'error.noSample': 'Select the test log to load.',
    'error.sampleLoad': 'The file could not be loaded: {filename}',
    'error.invalidSampleName': 'That sample name is not valid.',
    'error.sampleList': 'The sample list could not be loaded.',
    'error.fileRead': 'The file could not be read',
    'error.emptyInput': 'Enter the text you want to analyse.',
    'error.correlation': 'The correlation analysis failed.',
    'error.analyze': 'Something went wrong during the analysis: {message}',
    'error.duplicateIoc': 'That IOC is not valid, or it is already on the list',
    'error.noExportData': 'There is nothing to export',
    'error.unsupportedFormat': 'That format is not supported',

    'file.csvHeader.type': 'IOC type',
    'file.csvHeader.value': 'IOC value',
    'file.csvHeader.total': 'Total',
    'file.csvHeader.unique': 'Unique',
    'file.csvEmpty': '(none)',
    'file.txtTitle': 'Extracted IOCs',
    'file.txtDate': 'Extracted at',
    'file.txtSummary': 'Summary',
    'file.txtTotal': 'IOCs found',
    'file.txtUnique': 'Unique IOCs',
    'file.txtTypeTotal': 'Total',
    'file.txtTypeUnique': 'Unique',
    'file.txtItems': 'Items',

    'helpDoc.basicHeading': '📋 How to use it',
    'helpDoc.basic1Label': 'Type or paste',
    'helpDoc.basic1': 'Paste a log or any text into the text area',
    'helpDoc.basic2Label': 'Load a file',
    'helpDoc.basic2': 'Drag and drop a .txt or .log file, or pick one',
    'helpDoc.basic3Label': 'Run the analysis',
    'helpDoc.basic3': 'Press the Analyse button',
    'helpDoc.basic4Label': 'Read the results',
    'helpDoc.basic4': 'IOCs are highlighted, with statistics and a chart',
    'helpDoc.typesHeading': '🎯 IOC types it detects',
    'helpDoc.typesNetwork': 'Network',
    'helpDoc.typeDomain': 'Domain',
    'helpDoc.typeEmail': 'Email',
    'helpDoc.typesFile': 'Files and system',
    'helpDoc.typeFilePath': 'File path',
    'helpDoc.typeRegistry': 'Registry key',
    'helpDoc.typeHash': 'Hash',
    'helpDoc.typesThreat': 'Threat intelligence',
    'helpDoc.typeCve': 'CVE ID',
    'helpDoc.typeFlag': 'CTF flag',
    'helpDoc.whitelistHeading': '⚪ Whitelist',
    'helpDoc.whitelistLead': 'You can exclude IOCs you already know are safe.',
    'helpDoc.whitelistAddLabel': 'Add',
    'helpDoc.whitelistAdd': 'Type in the box, then press Add or Enter',
    'helpDoc.whitelistRemoveLabel': 'Remove',
    'helpDoc.whitelistRemove': 'Press the x next to an entry',
    'helpDoc.whitelistDisableLabel': 'Turn off',
    'helpDoc.whitelistDisable': 'Use the check box to switch it on and off',
    'helpDoc.whitelistSaveLabel': 'Saved for you',
    'helpDoc.whitelistSave': 'The setting is kept in this browser',
    'helpDoc.statsHeading': '📊 Statistics and chart',
    'helpDoc.statsCountLabel': 'Statistics',
    'helpDoc.statsCount': 'The total and unique count for every IOC type',
    'helpDoc.statsChartLabel': 'Chart',
    'helpDoc.statsChart': 'A bar chart of the same numbers',
    'helpDoc.statsFilteredLabel': 'Excluded',
    'helpDoc.statsFiltered': 'How many the whitelist removed is shown too',
    'helpDoc.statsThemeLabel': 'Dark mode',
    'helpDoc.statsTheme': 'Use the moon icon to switch',
    'helpDoc.exportHeading': '📥 Export',
    'helpDoc.exportDefang': 'It reads the defanged spellings [.], (.), {.}, [@], (@), [at], '
      + 'hxxp(s), [://] and [:]//. '
      + 'The screen keeps the original spelling and the counts use the refanged value. '
      + 'Tick "Defang the output" to write network IOCs back in a harmless spelling.',
    'helpDoc.exportLead': 'You can download the result in these formats.',
    'helpDoc.exportJsonLabel': 'JSON',
    'helpDoc.exportJson': 'Structured data for other programs',
    'helpDoc.exportCsvLabel': 'CSV',
    'helpDoc.exportCsv': 'A table Excel can open (with a BOM)',
    'helpDoc.exportTxtLabel': 'Plain text',
    'helpDoc.exportTxt': 'An easy-to-read report',
    'helpDoc.keysHeading': '⌨️ Keyboard shortcuts',
    'helpDoc.keyEnter': 'Adds the whitelist entry you typed',
    'helpDoc.keyEscape': 'Closes this help',
    'helpDoc.useHeading': '💡 Where it helps',
    'helpDoc.useCtfLabel': 'CTF',
    'helpDoc.useCtf': 'Find flags and hints buried in a log file',
    'helpDoc.useIrLabel': 'Incident response',
    'helpDoc.useIr': 'Pull out attacker IPs and malware hashes',
    'helpDoc.useEduLabel': 'Security training',
    'helpDoc.useEdu': 'Practice material for log analysis',
    'helpDoc.useThreatLabel': 'Threat analysis',
    'helpDoc.useThreat': 'Collecting and preparing IOCs',
    'helpDoc.notesHeading': '⚠️ Things to know',
    'helpDoc.note1': 'A file can be at most 20MB',
    'helpDoc.note2': 'Everything runs in the browser; nothing is sent anywhere',
    'helpDoc.note3': 'Detection is based on regular expressions, so false hits are possible',
    'helpDoc.title': '🕵️ IOC Hunter help',

    'footer.before': '🔗 GitHub repository: ',
    'footer.after': ''
  };

  let language = 'ja';
  const STORAGE_KEY = 'ioc-hunter-language';

  function t(key, values = {}) {
    const dict = language === 'en' ? en : ja;
    const message = dict[key];
    if (typeof message !== 'string') throw new Error('Unknown message: ' + key);
    return message.replace(/\{(\w+)\}/g, (whole, name) =>
      (Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : whole));
  }

  function apply(root = document) {
    document.documentElement.lang = language;
    document.title = t('app.title');
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('app.description'));
    root.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    for (const attr of ['aria-label', 'title', 'placeholder', 'alt']) {
      root.querySelectorAll('[data-i18n-' + attr + ']')
        .forEach(el => el.setAttribute(attr, t(el.getAttribute('data-i18n-' + attr))));
    }
  }

  function setLanguage(value) {
    if (value !== 'ja' && value !== 'en') return;
    language = value;
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* 保存できない環境では記憶しない */ }
    apply();
    document.dispatchEvent(new Event('languagechange'));
  }

  function init() {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) { /* 保存できない環境では既定に従う */ }
    const query = new URLSearchParams(location.search).get('lang');
    const navigatorLanguage = (typeof navigator !== 'undefined' && navigator.language) || '';
    language = [query, saved].find(value => value === 'ja' || value === 'en')
      || (/^ja\b/i.test(navigatorLanguage) ? 'ja' : 'en');
    apply();
  }

  return { ja, en, t, apply, init, setLanguage, get language() { return language; } };
})();

if (typeof window !== 'undefined') window.I18n = I18n;
if (typeof module !== 'undefined' && module.exports) module.exports = I18n;
