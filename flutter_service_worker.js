'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "version.json": "cc1fa9cce5af273c0909d105387fee89",
"favicon.ico": "f5539a8127f1130cbdf1b74a9c9a717e",
"index.html": "7703804f86a79d33ab40dcf12ce8770b",
"/": "7703804f86a79d33ab40dcf12ce8770b",
"main.dart.js": "7c1a4dc40fa3b177b06cd6e801e3ddf2",
"flutter.js": "a85fcf6324d3c4d3ae3be1ae4931e9c5",
"favicon.png": "4abcc239451062d353876ae147c38f06",
"icons/Icon-192.png": "858c860036a7e80ca20da73a056df0ee",
"icons/Icon-512.png": "a4faa731ac284078b73d6bb97ea2b07b",
"manifest.json": "a67989697c366cf4f821bde4733a6ca8",
".git/config": "ae2c3d3a78e08746cfd01be21813b358",
".git/objects/0d/ec38dec4a3f8d0b4f839999385f26c5722b491": "7cd50f26fe4eb3ba0329b4dff0e07cdf",
".git/objects/0d/6a4ffdf02a1ee8d5c503f3ddca2c2a118b1d9b": "9276194f3bcb649539ec37ac5c842bed",
".git/objects/0d/0df08f7c3e147a8ae36017cf81a96e35b73717": "106e868f28a72727fb6fb0fa71123633",
".git/objects/59/9d2309a1abf85b2682e6fa65c01398e44b4af8": "55f0a306125a6bf3ce68f17853cb3ae8",
".git/objects/3e/5b460291b1425d006479822973d304d532989d": "1d777b70de5f560a184bc6dc4385e26a",
".git/objects/57/08a8d524b45700307b86206d959c3a3664e33e": "c3e2419a60eaac9ea100562847d13635",
".git/objects/57/8ffc38e206aa5bb2f4265d1c7477e749098f24": "b1ed51ebf23ea48d67a19ce3d88ab994",
".git/objects/3b/3da3fca283ad54e5fdc85dedf5bc2b282d48b4": "237569c51111eed83bf4b300d2fc8ff9",
".git/objects/03/066d298c0c1cc5f198493369f9aab5da90916b": "71e1b9a3606cfe11eba144d9a50c52eb",
".git/objects/04/cc09ddba3f850e8a59b6b6c90f2bcf8cf5eaa7": "84c12afe45fbbccd3d0c51a19dad4343",
".git/objects/04/13d118a32a1297f2d67d905d348f8c35a96207": "d112f8335ba3e72227fcd33942c6c490",
".git/objects/6a/562868741911ffc3a5345f3c094a71eb0d073d": "ad3237b80e6dc65be0e2000c6c0a445f",
".git/objects/51/ed6bd9c09b2c65c55d94629611fe6f8b417e9b": "3250c6471a1441270bb9c4021c8b653a",
".git/objects/51/4ddab0f5e8db22361a61afc6758b03f6e0f75e": "c6ae2198f875bab556823a9108a3ca1a",
".git/objects/67/dd2d0f4cdabec7ace6788fbd87c3652219600f": "737bba9fdc51fb753b18c64827f45279",
".git/objects/0b/5a05726bc832184bb65b4dbc1a01986b9e46d8": "4c85c004c3ad4cdc4f2e8bc636ac691a",
".git/objects/60/36ed029f8f4a0027f8b1fac2a3ebcdc12798d3": "8de8fd89426017e167a44fd0c737bd72",
".git/objects/33/d4371ad7cfae33b22c2ecc5d9e15dbb2cc13b5": "a83948659f69e96bfd44257ed9c13dff",
".git/objects/02/0f5e56a927a04113ecb38d06238b0c2998ee52": "b74ec5f14b7d6eaa207cddb2b632edf0",
".git/objects/a4/2ce31eaceb0655e1b5efc1e3d4d343fb788de9": "8451790c3179bbbb3df6a9821de3fecd",
".git/objects/b5/d3147179332af8726aa0dec295a8213655a34d": "578957d3cdb263fb43d4d5c66d38a71e",
".git/objects/b2/57db3e5bd45d093ed24c06fdfe8b81ba9fe57a": "6e68cd1d2ab76712dfe534e33e4d48a9",
".git/objects/be/cd3f9876479ebecfb30a5ca9e1b2a908eab255": "bf7c1556690fc02f18ae5573366e2ded",
".git/objects/a2/ec70eba48bc89dfc723e53ff8879abd442000f": "31867decaf4625c0a717b814f9efc89a",
".git/objects/a2/dc009f691a71b2fb3453f2c31531a1d05e7ad8": "1dc123223af3d97921788efd3d403d46",
".git/objects/a5/2ef3991b285be7312f829d74408983b7aec3d5": "c8545eb9e2ba7ed0d74fe33e5f4b0935",
".git/objects/d6/9c56691fbdb0b7efa65097c7cc1edac12a6d3e": "868ce37a3a78b0606713733248a2f579",
".git/objects/d6/85510874af238852c0c9fec81b9c5b0f870fce": "ae2fde46017d827b97ba52ebae2b75b9",
".git/objects/d8/535e7e46e8e467dc9734911d3fd290e363254a": "e76b5aea0c55d4a864947808c5e2e716",
".git/objects/e5/951dfb943474a56e611d9923405cd06c2dd28d": "c6fa51103d8db5478e1a43a661f6c68d",
".git/objects/e5/a7adfee9cc2a29543ca5eb5a5f75fece32bf44": "f0335083b34d8b21ac61b1fd8b1ccc4f",
".git/objects/e5/9e36625d9fc9cdc6a77a36b55f1a7fd7cdf871": "9ba644f16423a07a864b2e6e8550fe35",
".git/objects/e5/36e95046a62c8fca3cf67a92df08138687da4f": "5c9023872010dca048ed179dd95c57ab",
".git/objects/e5/539db0602749930d3f7e9a55b0361a2a7351bf": "be0a69e6e29311db0d93f732f837e7de",
".git/objects/e2/ccbcf2add478c8d3029fc72d9de7dbc6e47ef8": "5410a4113ca95592aa79204d935a8d62",
".git/objects/f4/3c5d284122f6b9b500d94dd8fc0c9b4194d488": "879deb6d16c8e67bd2d3f94220bac013",
".git/objects/f4/047878f70474110732f9aa84a2bc14a3cfff2e": "74232305b1401499508996f3ef710b27",
".git/objects/eb/9b4d76e525556d5d89141648c724331630325d": "37c0954235cbe27c4d93e74fe9a578ef",
".git/objects/c9/40185aec4dc758286c5c9285d27776f6ac6092": "70b46f461122d7df873011ba2f9af271",
".git/objects/fe/068e7b362d9474333d067c2d38503861284a03": "d7adaee2b5e1c907debff45eff9a39ac",
".git/objects/fe/fa785366515bb20ae0f6dcc12448953fc9b665": "408096d408b7db9ee4461582bc43be35",
".git/objects/fe/804124f152f8f08b20a3b6f5b874b83d2945dd": "e5f9b4ff677bb3db322debfd5f7fc440",
".git/objects/c8/eac9734f6c2b570a516cf0586cefbe27f60a6f": "70aa92825d35ed5a35e9ede9eacaae05",
".git/objects/c8/d2f2761f381ec6c6c67a2e90422536fd9cb635": "8f62ac4cb23fc725eda660c81ce893c2",
".git/objects/ed/eb4134d5301bfb88cb83f2b4ec9169858abda3": "9259fc103b4784aa583cf714ed1d4860",
".git/objects/c1/a5455c70518cfa979a091e563c5931c039ed79": "2d33560291ff9f92c7cb0f77366ad49f",
".git/objects/c1/0eb77cdd5ba735118687ad5a77966495e17703": "95302c3cda95438bbbac94229b1343f5",
".git/objects/4e/89617a3696bd10c155ec378f4a65a9f89e9e3a": "d8056e20bae90d092b619c895129e982",
".git/objects/4e/2029771f9a70e509c72f44c903b9afb5c99fba": "ad20f27c50d9bac1a9040745c6fcca06",
".git/objects/18/e871eb364c5b57e19a2450826ab89c401e4441": "256f137c7cca2d1686ef8880937f5af9",
".git/objects/18/090b6c28f7a2b828ffed3bd02105ed309db016": "7638a3028d6c9b8491e6b3fb7060a3b3",
".git/objects/4b/ce11f832f26ee264d95b6790237601cf5a6088": "d9243641979aa81a886b057ab392745a",
".git/objects/7d/1010b9497b80bc1ef4754e7a68af54f467babe": "0b43c87b5b44ea001b3a267e57b3f794",
".git/objects/16/2e30189f3d530b69cd0ad30fd3616f40134e4a": "2e58e09a2c604288d2bcd9577b537bcc",
".git/objects/89/dfe5c2d6b5ae3b8be1c2739a970d43733840eb": "7076fed71846a1632aa3104a284ef4a5",
".git/objects/89/52156fa755058244ea59a733f13ec5d6e71bb6": "5e8221a6ae931265fa33b7ecff170026",
".git/objects/45/6b6302535a1525b9423cc896ca1217c3565765": "d28953b79bf182f54d5d9ba7f8ae854d",
".git/objects/73/40c8a0942575063bec04d3e795b65c63a52b22": "46894b4ca04d84bff1fadb5f39226d02",
".git/objects/73/a5ca9e6ea457a8e87e3e88047b9268f15bb75b": "437e873491b95548ba60fecc00fa7933",
".git/objects/73/91a7285862fc7aca6d6b91dc150a189f0be3d1": "7cbc059e991fd958affc20357ca61567",
".git/objects/74/2da53a6076066c8133f6f39418672dd2c6abf6": "824c93c421196977ed0b01994101f169",
".git/objects/28/1c82962782d640245541fb38a856f805e04868": "55af693ac26ef76c7b8cc8a88155c0cc",
".git/objects/28/9bf99d20c18ec97ab6734b7c22bc6a36414bfc": "3e0f975c8b55467e99dd2130859b9e4a",
".git/objects/28/a160c10f42bd86044b3e790d71ac28ffa9ccdb": "a2723df12c428bf621db04adadd0eb84",
".git/objects/8f/15652ae8756dc386b044868ce19143a7759872": "8df7be05a461ebcfbf9e311c15b6bbc7",
".git/objects/8a/46807747671484008a69ff852945f467193660": "2154a695b81b555081e378ad93bb29a5",
".git/objects/7e/f146e51fc5d297c89ac29711cf25dac2b3328b": "7738b4f70fe0edd355d464264f4b7553",
".git/objects/7e/38170510cbb88cffb3e48f57d9668b47db1743": "3b244be9c9e551206e3e1d2569e08012",
".git/objects/7e/d6aed3a4307e5cfe952f45c16790de4b8877a3": "4284bf72f12274fc8174002eba597f46",
".git/objects/19/78ea436db405ebf434d713422a851787332688": "293e6e67c99d7bea753abc0ddb8cb642",
".git/objects/19/5caada065db12d587e291d220daa8f19149492": "94c39495a8a6f072b6c597cc02c736c6",
".git/objects/4c/aa1624e72ed41ad5945e916422e65e9b3c4bd4": "654687a00becf581ed907f2ebf150107",
".git/objects/21/d3b904b1468ccf08a7154fcc31d48087b9b11e": "f6e986429d1d8bf07d7da0d3f3184798",
".git/objects/4d/836c17b217c12bce33e4c6bbb77c6280396af4": "acdec64cb89f60219fbc0fa80787d523",
".git/objects/75/9ce388753a436f40b75f574d1377077a7a40ec": "22405202bcf8e16da18d3b49990c9820",
".git/objects/88/cfd48dff1169879ba46840804b412fe02fefd6": "e42aaae6a4cbfbc9f6326f1fa9e3380c",
".git/objects/07/61585ca68f63471e52a9731e15045297bab528": "9a2bc6cd77c4b67ea120f764fde3239c",
".git/objects/38/a9e18b9bff8b34423991bee2000fcb61cba702": "debc9b2aa19ba18e9c2191690eb5baa8",
".git/objects/00/0c6bdd60d70b769fe2a222cef51788d5398e40": "b4f98fb7a089891a1281a2282f323867",
".git/objects/5d/7e4bee8235ff059b60036339595e2299d52962": "be3e9304b46595f01160344fda746d43",
".git/objects/91/e516239d68d6616478b2bad15895dc14f9b087": "768b07ba2405be6dfc2982453328cc79",
".git/objects/62/2d44445fddf84d3535223a1bf5da6e80fd593a": "c349b932a14fd1b117a430472e95e357",
".git/objects/62/8e82867183fa635c4510a059314c2d2c78f4b8": "92b99c2f2ae0c0713b6d0b0aceed996c",
".git/objects/96/ab6ff71c97498687e6af76cd093b1feba82dcb": "191948801d7896a353d11582026f25a4",
".git/objects/3a/7048e354b126e8e3a500b0a8671bc7170bcaf7": "1253be57ba75470d786631033cff669a",
".git/objects/30/cb62bd2847e8d4c663ea17d58af0c2b463f6ee": "5a38392c551ba0fe7b06a424ca325280",
".git/objects/5e/5e49998c423b79a257d4ef60fab61a011d9093": "0f8789417bab1f3c03c2b2a79a53af04",
".git/objects/5b/7aec2601ee99b7c3862af4d239ad7efe3f2c43": "b5ddc9be5dfcdc9b62ccf70ea9bea4b4",
".git/objects/37/276f13ed2f6e1fda10b46196bf6b243d4809b1": "5af30319433d8fdf8fde40edf747f612",
".git/objects/37/7ead7488ba04497de54363ee4e4436edf85774": "d08a584d3f7b4fb2a65c159d695456ff",
".git/objects/08/c18b200446d6160586e37c77e67ccbee126052": "147e2fbabccda13bc3ffefdbdd13f2a9",
".git/objects/08/d3b25d9af275ac2512b5841503321224347a30": "4662d7b7e2d8c27a2c05762efd1a2ae5",
".git/objects/01/212163acb1526c587a75999d2342dc3cb530c4": "b305a64e1ecf9f03943e9f2276542ea3",
".git/objects/06/0d1e97beba2fb3ab7c4896f8e762a6af1a24f3": "01e68fa88d44ff009aa0ce61149cf01c",
".git/objects/06/c01ddf2e75288f6015b85c1fa2dbab9b30e5f5": "5d6d3ff00c451a3899dd63a8112b39a8",
".git/objects/6c/e9ffb2619f6b05c67770e2eea40624557bfc79": "f5e195cbccc06212443286763322eafd",
".git/objects/55/919b0b32f21410d9755ffbe64aeb2d07650744": "ffb88073b04c5f9454f1e7f08edc733c",
".git/objects/55/def49e285d7620f581037fad52aa1b8947c12c": "6d61eee2b6eb4822deb321992fdfae1b",
".git/objects/97/ceff7481d8555a2cb720ffb4a7d71f404d4daf": "38c71477af1ccb8369d8445c926d3ed7",
".git/objects/0f/10b581ff4d6fe69d6bb2f38beb5dce73558770": "21908b95e28b0128a061c8afd9ee27a4",
".git/objects/0a/2aa78dead5ddb1c64520cd6b9a7715ab95528b": "23bda8610fffe8cd9a25993f8e8f50a3",
".git/objects/ba/873595714be0aed5b3f40c3f409125d58b741e": "090eab633a2fc6144387ae5913e6fe15",
".git/objects/a0/209ba14c09b5c81c0a7ab74f24cdcc0899d39c": "a951da7f2347911216fe075e6e111a77",
".git/objects/dc/f8cf63c71241ed200dbd4f8ac47cc80da61c91": "93e2f56cccb453c1fe568aea1a8dda98",
".git/objects/dc/a8daa5236f906aad3dd0e72c8837f5330bab5c": "827691eb559ae14fb93773a6b41314c7",
".git/objects/dc/132f4c3b3f97c81e9775a78bc51f25c30b45c4": "c67a1a008345f55736a603b3290915a0",
".git/objects/d2/2b2e796c7508b745e2e7ae98acd35752f42fa6": "5fa634d6aaed55df47cd19193ff6398b",
".git/objects/d2/190b5139486ecf8c655e1cc1d06e8df3ffe249": "38d744ba160ce93006e81e51ecaed9b8",
".git/objects/aa/f9775aa89c03137dbf48721cdc05191703de5e": "25802b31f0bee36b4e1a7a67835f99f0",
".git/objects/b7/49bfef07473333cf1dd31e9eed89862a5d52aa": "36b4020dca303986cad10924774fb5dc",
".git/objects/b7/8fd062c6141df6f70e3fc463f615596a42f9f7": "c23304c35951aa62db78c621b7b15359",
".git/objects/b7/b4dcc060d5c1f24b94d50352084a44e8696faa": "17f1b87376a6d9dafcacece2e14a8c5a",
".git/objects/db/05b329a2434e6717c809a12aa3d411bc8693aa": "0241822ba20b91dafd96d4769e7b695d",
".git/objects/a8/c24dd74ee59cd083497fea69ad5190cf7d61e6": "024dd13584ed35898c4f6744489cc8cb",
".git/objects/de/28db843d7df6ed23b8a7526f6b6b4a83425fe7": "797e4f7b3d8dced098c51679ff33e848",
".git/objects/b9/2a0d854da9a8f73216c4a0ef07a0f0a44e4373": "f62d1eb7f51165e2a6d2ef1921f976f3",
".git/objects/a1/3837a12450aceaa5c8e807c32e781831d67a8f": "bfe4910ea01eb3d69e9520c3b42a0adf",
".git/objects/a1/ee3d6edee8c23eb09bd89d428ecd4d5faebb1a": "11900b806f601339da37965eaca6cc0d",
".git/objects/ef/8bd267d011e8ca575cf2516880fbf849e16f53": "82c35927472286191dc28a26fa363d7f",
".git/objects/c3/e9627f99cd7153b66be6a774d006bf79d2663a": "2f734a617c36fd037b296bee07a6495a",
".git/objects/c3/75b545d3c3b0d7fee843cd2e07ecbbff5bdb9b": "6371fbe91f859af3dd79080a3d3697d0",
".git/objects/ea/2a8e8879c5a64bdb9130655ad580b067ff39ce": "c34c2e9736ec5658db9bcd090c03a155",
".git/objects/ea/98a479593de75611b6a182872afbfb4881f030": "855953822a94f01f1122f9a2e959192b",
".git/objects/cd/22076013ce8b84475eae9bb4cd6c60b5460fbe": "81c620e2d6cbe5638d6c90ee25886389",
".git/objects/cc/74eb2418b736f6fd71d6a816cec086c97d7344": "c6f004f0d7e3d9f29f5db3eda0018f7a",
".git/objects/e8/08b04c4689c591b0961619a5744094d7c61521": "106cbb6434dcf482175fcfee7c178b44",
".git/objects/c5/625d9de4720a5156a03ee132ba07e1c54080ec": "c230aef8335acdfaaae1e58e67753a56",
".git/objects/c5/e5ae2bf2cb789bb60587a3109b130290951d0b": "695e8044aecd0e1107a1526a0a1e3214",
".git/objects/f6/db18fc1d5aca7c9274b2fa6d9f7d121b62e3a0": "9864e2de9ffca5f3aacdea99efc52f08",
".git/objects/f6/b931f643dbd6dcb8c13eec441cd9f1942b6688": "cf6b60f1696502b22d37359ffbb6da9d",
".git/objects/e9/e575d0b36ebd696294496017834c26b62e1505": "8eca52e53d59927cc7c00a13888ea67b",
".git/objects/e7/d4dd2efc49ec95fa427f52e45617846d328f84": "3edaa30af82162c2c8ec8d6a4111d670",
".git/objects/e7/c48a09cd6564388b749ef5b2decce0564da798": "ea818971e0fd68ff7cb17ee3c7c95ade",
".git/objects/cb/3d1e966cc0c2a6a8debafa3952a859d88e9f66": "23d031fc31847441bc0cda8f6ff5894c",
".git/objects/e0/964a9ed341a65cc52769d414a286ef8e189a44": "15fbb958fc752bc4e9c11d6234f5e536",
".git/objects/79/ba7ea0836b93b3f178067bcd0a0945dbc26b3f": "f3e31aec622d6cf63f619aa3a6023103",
".git/objects/2d/cf3542c874e33cd8ab86ceb6f0ec444228aa78": "66baad0ae5d874f09b6eee790095bc65",
".git/objects/41/5c059c8094b888b0159fdedfd4e3cb08a8028e": "86914685ccd40e82a7fe5b70459fb9f7",
".git/objects/1e/d6d11b9b6a2510fa32b7dc680d66df1119b46d": "88a4253c77b8cef127cac06f104f88a3",
".git/objects/24/b1f14dd348b07c9b8373758bde9ac14d16fd92": "dbf45d6c044044561758a334420e9569",
".git/objects/12/5c284dc2bbed823ed6389e50cc75a8a1ef2351": "9ab0bcea773dc4fd6ef989aef459b28a",
".git/objects/8c/99266130a89547b4344f47e08aacad473b14e0": "41375232ceba14f47b99f9d83708cb79",
".git/objects/8c/197fb602da5762293c3ab1caa31b2ccd73c5e7": "ffc440907100263f6798ca05416ea6da",
".git/objects/85/b432817e19e5314116a4f387bbec0811265869": "cfe273d2b780aa9eead92cf46427a0ba",
".git/objects/76/98ffb33d69bb8fee3732640070bf0b714bc829": "a0263c3935ce503cbe1ad9dfc1748e73",
".git/objects/76/8651b2e249c2517c7b37bdbeea0a5d8bfbb707": "495b1c4fefa633f6afe4dc5840ebe18f",
".git/objects/49/f502c6d3e9210448c8f9457327d94ee96b518a": "0d98d3631f6d63ef979446b6c4ffce79",
".git/objects/40/4ea47f1ef91bd6bf0af27131f5d2b278e59ea4": "362521ae30b6c90321d2477ffb39bf47",
".git/objects/2b/dbc2ceafbf3c94f9c1a7407a96c7123e805ffc": "5345644f5f2521b77bcc545ea47df286",
".git/objects/2b/4a074e335ed1753785d4798beb6dabb495f1df": "8cfc7967e5693672f9040c067030db1e",
".git/objects/2b/9c9a2d0c202179e4abd0cf9da51f7758b07a20": "1715d18b7fde3de4f4e53753a0be814c",
".git/objects/47/92d4655982b5f9a447d175097823a8a26503f4": "1f88e4fd3e81a50fff85db2d56fda62c",
".git/objects/22/5b951c95c89feecac6d9b67bbb6e91f5013391": "9bbbf088bf7d040fa9552965e1e8e968",
".git/HEAD": "cf7dd3ce51958c5f13fece957cc417fb",
".git/info/exclude": "036208b4a1ab4a235d75c181e685e5a3",
".git/logs/HEAD": "9e68804a89a756c086ec45ae96028735",
".git/logs/refs/heads/main": "219fd4c64482b9844afc62552597f970",
".git/logs/refs/remotes/origin/master": "05d5d7017e24ecd4263c0a7ca6d26bcc",
".git/logs/refs/remotes/origin/main": "ffd83d4d3f98db79c4aa8bd48a4f1902",
".git/description": "a0a7c3fff21f2aea3cfa1d0316dd816c",
".git/hooks/commit-msg.sample": "579a3c1e12a1e74a98169175fb913012",
".git/hooks/pre-rebase.sample": "56e45f2bcbc8226d2b4200f7c46371bf",
".git/hooks/pre-commit.sample": "305eadbbcd6f6d2567e033ad12aabbc4",
".git/hooks/applypatch-msg.sample": "ce562e08d8098926a3862fc6e7905199",
".git/hooks/fsmonitor-watchman.sample": "ea587b0fae70333bce92257152996e70",
".git/hooks/pre-receive.sample": "2ad18ec82c20af7b5926ed9cea6aeedd",
".git/hooks/prepare-commit-msg.sample": "2b5c047bdb474555e1787db32b2d2fc5",
".git/hooks/post-update.sample": "2b7ea5cee3c49ff53d41e00785eb974c",
".git/hooks/pre-merge-commit.sample": "39cb268e2a85d436b9eb6f47614c3cbc",
".git/hooks/pre-applypatch.sample": "054f9ffb8bfe04a599751cc757226dda",
".git/hooks/pre-push.sample": "2c642152299a94e05ea26eae11993b13",
".git/hooks/update.sample": "647ae13c682f7827c22f5fc08a03674e",
".git/hooks/push-to-checkout.sample": "c7ab00c7784efeadad3ae9b228d4b4db",
".git/refs/heads/main": "899bf05b0b948743210e1811cf8484bf",
".git/refs/remotes/origin/master": "88a8be4f4155fc49d623f165c7912adf",
".git/refs/remotes/origin/main": "899bf05b0b948743210e1811cf8484bf",
".git/index": "5fadcf430ac8c8acab10a83f661dedc2",
".git/COMMIT_EDITMSG": "a8297d555dd34879e8e48e1cf12acefa",
".git/FETCH_HEAD": "465eddc08eb3fd42529453d301fd26e3",
"assets/AssetManifest.json": "8d3266477205bcdd69988d53c2e44de8",
"assets/NOTICES": "bd0690c690ecb57fb4681e2218a45250",
"assets/FontManifest.json": "49430a40025b04110cf32e0e1256983a",
"assets/packages/material_design_icons_flutter/lib/fonts/materialdesignicons-webfont.ttf": "dd74f11e425603c7adb66100f161b2a5",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/easy_localization/i18n/ar-DZ.json": "acc0a8eebb2fcee312764600f7cc41ec",
"assets/packages/easy_localization/i18n/en.json": "5f5fda8715e8bf5116f77f469c5cf493",
"assets/packages/easy_localization/i18n/en-US.json": "5f5fda8715e8bf5116f77f469c5cf493",
"assets/packages/easy_localization/i18n/ar.json": "acc0a8eebb2fcee312764600f7cc41ec",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/assets/images/portfolio1.png": "97ce2cc6b8f3097a54babb3f668c239f",
"assets/assets/images/portfolio2.png": "c9ea4b0c330e12e5aee5a7eb280a7863",
"assets/assets/images/portfolio3.png": "3341f26d65a7ae891072e6c83fd2dc20",
"assets/assets/images/iphone.png": "23694cbc4d32e5d1985ae19f666bdc95",
"assets/assets/images/profile.png": "3fd81f03eeb14f1477940399d8c375d0",
"assets/assets/videos/home.mp4": "60166fcbb25e48fb10a14d39f27e8be7",
"assets/assets/icons/gmail.svg": "a73bfa2a784b2c8bce5665aabe77315e",
"assets/assets/icons/github.svg": "718891a8faf8dea0c5e504c2688b4aa8",
"assets/assets/icons/instagram.svg": "8af1ee27ab30238926eaba45f485f18a",
"assets/assets/icons/parrot.svg": "4449deb7dfe7ee6b6f2b42f5a432969f",
"assets/assets/icons/app_store.svg": "fdd4ca9b7d572930d04910943d4394fc",
"assets/assets/icons/velog.svg": "3f4d5772e8d321add1618bc4373fbf92",
"assets/assets/icons/google_play.svg": "358995c16d54a790ca29f133d4b3a013",
"assets/assets/fonts/Pretendard/Pretendard-Regular.otf": "46b0c48afd8b0ddc2ed4fcbb2df81d8b",
"assets/assets/fonts/Pretendard/Pretendard-Black.otf": "6bc3f501ba4e736b706074a29826ec0a",
"assets/assets/fonts/Pretendard/Pretendard-Medium.otf": "9ac30a1a68a5140a58b23aaf8025f1db",
"assets/assets/fonts/Pretendard/Pretendard-Light.otf": "aef3dc5f5592a0a9bfd7e8de7abdc2c5",
"assets/assets/fonts/Pretendard/Pretendard-ExtraBold.otf": "dac19e30ed93b7aed171830c38cda6a2",
"assets/assets/fonts/Pretendard/Pretendard-Bold.otf": "e93f79700405e1b4c1b3e70d8c378ca4",
"assets/assets/fonts/Pretendard/Pretendard-Thin.otf": "0b09a12c024a6380cd40dbfaf2fd79cd",
"assets/assets/fonts/Pretendard/Pretendard-ExtraLight.otf": "23002daa2dee07f8a652bb0ab06af079",
"assets/assets/fonts/Pretendard/Pretendard-SemiBold.otf": "d9d912f2630bae445757f4769271c35c",
"assets/assets/fonts/BebasNeue/BebasNeue.ttf": "b2b293064f557c41411aac04d6f6710d",
"assets/assets/translations/ko-KR.json": "3cf5d7cde8060654e8490a7823e86047",
"assets/assets/translations/en-US.json": "f38abf901e2b9a97b25231866e092a6c",
"canvaskit/canvaskit.js": "97937cb4c2c2073c968525a3e08c86a3",
"canvaskit/profiling/canvaskit.js": "c21852696bc1cc82e8894d851c01921a",
"canvaskit/profiling/canvaskit.wasm": "371bc4e204443b0d5e774d64a046eb99",
"canvaskit/canvaskit.wasm": "3de12d898ec208a5f31362cc00f09b9e"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
