import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://oitrivgffkdhkedhydqw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_4PqLCIH-jrX0AsF9ws4fIA_EKIRO4d8";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 웹 푸시 공개키 (비밀키는 Supabase edge function secrets에만 보관)
const VAPID_PUBLIC_KEY = "BB6wWCFQr9AVrGNXoxQW21DXTy12xJLWo8DZQmDTC9YaaqpkMs67ON8yyNm9BpxSLMorqs5ciKXjSS3Qu6UHZQ8";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
}


import logoUrl from "./assets/yori-logo.jpg";

// ── 데이터 ──────────────────────────────────────────────────────────────────
const OWNER_WHATSAPP = "+4367763107304";

// 레시피 기본 목록(필터 미선택 시)에서 카테고리가 표시되는 순서. 여기 순서만 바꾸면 정렬이 바뀜.
const RECIPE_CATEGORY_ORDER = [
  "Vorspeise", "Hauptgericht", "Suppe und Eintopf", "Reis und Nudeln", "Tteokbokki",
  "Beilage", "Dessert", "Getraenke", "Sauce", "Brühe", "Teig",
];


const SUPPLIERS = [
  {
    // Trünkel: 2026 전체 납품서 확인 결과 — 닭넓적다리살, 불고기, 삼겹살, 랩스오일, AMA 닭구이 확인
    id: "truekel",
    name: { ko: "Trünkel (고기)", de: "Trünkel (Fleisch)" },
    channel: "whatsapp",
    color: "#C0392B",
    icon: "🥩",
    items: [
      { id: "ama_grillhahn", name: { ko: "AMA 통닭구이 약 1200g", de: "AMA Hühnchen gegrillt ca.1200g" }, unit: "Stk" },
      { id: "bauchfleisch", name: { ko: "삼겹살 (껍질없는)", de: "Bauchfleisch ohne Knochen" }, unit: "kg" },
      { id: "bulgogi", name: { ko: "불고기 (소고기 TK)", de: "Bulgogi (Rindfleisch TK)" }, unit: "kg" },
      { id: "huehneroberkeule", name: { ko: "닭 넓적다리살 2x2cm", de: "Hühneroberkeule 2x2cm" }, unit: "kg" },
      { id: "rapsoel", name: { ko: "유채씨유 10L", de: "Rapsöl 10 Liter" }, unit: "Kanne" }
    ],
  },
  {
    id: "ebenezer",
    name: { ko: "Ebenezer (야채)", de: "Ebenezer (Gemüse)" },
    channel: "whatsapp",
    color: "#27AE60",
    icon: "🥬",
    items: [
      { id: "champignon",       name: { ko: "양송이버섯 2.5-3kg",       de: "Champignon 2,5-3kg" },                     unit: "Kiste" },
      { id: "chinakohl",        name: { ko: "배추 8-10kg",              de: "Chinakohl 8-10kg" },                       unit: "Kiste" },
      { id: "doufu_pao",        name: { ko: "두부피 180g",              de: "Doufu Pao 180g/pkg" },                     unit: "Pkg" },
      { id: "eier",             name: { ko: "달걀/개",                  de: "Eier/stk" },                               unit: "Stk" },
      { id: "fruehkraut",       name: { ko: "봄양배추 ca.8-10kg",       de: "Frühkraut ca. 8-10kg" },                   unit: "Kiste" },
      { id: "knoblauch",        name: { ko: "깐마늘/kg",                de: "Geschälter Knoblauch/kg" },                unit: "Pkg" },
      { id: "tofuhaut",         name: { ko: "건조 두부피 슐라이페",      de: "Getrocknete Tofuhaute Schleife" },         unit: "Pkg" },
      { id: "chili_getrocknet", name: { ko: "건고추 통 1kg",            de: "Getrocknetes Chili ganz 1kg" },            unit: "Pkg" },
      { id: "gurken",           name: { ko: "오이 10-12개입",           de: "Gurken 10-12stk" },                        unit: "Kiste" },
      { id: "hdl_hotpot",       name: { ko: "HDL 훠궈 소스 매운맛 220g", de: "HDL Hot pot Seasoning Spicy 220g" },      unit: "Pakung" },
      { id: "ingwer",           name: { ko: "생강/kg",                  de: "Ingwer/kg" },                              unit: "kg" },
      { id: "tofu",             name: { ko: "이탈리안 두부 6개/2.5kg",  de: "Italien Tofu 6stk/2,5kg" },                unit: "Pkg" },
      { id: "jungzwiebel",      name: { ko: "쪽파 한 단",               de: "Jungzwiebel/bund" },                       unit: "Bund" },
      { id: "karotten",         name: { ko: "당근 10kg",                de: "Karotten/10kg" },                          unit: "Sack" },
      { id: "kartoffel",        name: { ko: "감자/kg",                  de: "Kartoffel/kg" },                           unit: "kg" },
      { id: "limetten",         name: { ko: "라임/kg",                  de: "Limetten/kg" },                            unit: "kg" },
      { id: "minze",            name: { ko: "민트 50g",                 de: "Minze/50g" },                              unit: "Pkg" },
      { id: "orangen",          name: { ko: "오렌지/kg",                de: "Orangen/kg" },                             unit: "kg" },
      { id: "rapsoel",          name: { ko: "유채씨유 10L",              de: "Rapsöl 10L" },                             unit: "Flasche" },
      { id: "sojasprossen",     name: { ko: "콩나물 2kg",               de: "Sojasprossen 2kg" },                       unit: "Pkg" },
      { id: "suesskartoffel",   name: { ko: "고구마/kg",                de: "Süßkartoffeln/kg" },                       unit: "kg" },
      { id: "rettich",          name: { ko: "흰무 12-15개입",            de: "Weisser Rettich 12-15stk" },               unit: "Kiste" },
      { id: "weisskraut",       name: { ko: "양배추 15kg",              de: "Weisskraut 15kg" },                        unit: "Sack" },
      { id: "weisse_trauben",   name: { ko: "청포도/kg",                de: "Weiße Trauben/kg" },                       unit: "kg" },
      { id: "zitronen",         name: { ko: "레몬/kg",                  de: "Zitronen/kg" },                            unit: "kg" },
      { id: "zucchini",         name: { ko: "호박/kg",                  de: "Zucchini/kg" },                            unit: "kg" },
      { id: "zwiebel",          name: { ko: "양파/kg",                  de: "Zwiebel/kg" },                             unit: "kg" }
    ],
  },
  {
    // Oilchem: 해바라기씨유 정제 단일 품목만 납품 확인
    id: "oilchem",
    name: { ko: "Oilchem (해바라기씨유)", de: "Oilchem (Sonnenblumenöl)" },
    channel: "whatsapp",
    color: "#F39C12",
    icon: "🌻",
    items: [
      { id: "sunflower_oil", name: { ko: "해바라기씨유 정제 (E900)", de: "Sonnenblumenöl raffiniert (E900)" }, unit: "L" }
    ],
  },
  {
    id: "panasia",
    name: { ko: "Panasia (한국 식품)", de: "Panasia (Koreanische Lebensmittel)" },
    channel: "kakao",
    color: "#FFCD00",
    icon: "🇰🇷",
    items: [
      { id: "agrana_kartoffel",      name: { ko: "AGRANA 감자전분 25kg",                  de: "AGRANA Kartoffelstärke 25kg" },                             unit: "Sack" },
      { id: "essig",                 name: { ko: "ARO 식초 5% 10L",                       de: "ARO Tafelessig 5% 10L" },                                   unit: "Kübel" },
      { id: "assi_sojabohne",        name: { ko: "ASSI 볶은 콩가루 226g×30",              de: "ASSI Geröstetes Sojabohnenpulver 226g x 30" },              unit: "Ktn" },
      { id: "cass_bier",             name: { ko: "카스 맥주 4.5% 330ml×24",               de: "Cass Bier 4,5% Alk. 330ml x 24" },                          unit: "Ktn" },
      { id: "chungjungone_glasnudel",name: { ko: "청정원 당면 (고구마) 500g×20",          de: "CHUNGJUNGONE Glasnudeln (Süßkartoffel) 500g x 20" },        unit: "Ktn" },
      { id: "maissirup",             name: { ko: "청정원 물엿 5kg×4",                     de: "CHUNGJUNGONE Maissirup 5kg x 4" },                          unit: "Ktn" },
      { id: "chicken_fry_beksul",    name: { ko: "백설 치킨튀김가루 1kg×10",              de: "CJ-BEKSUL Bratmischung f. Hähnchen 1kg x 10" },             unit: "Ktn" },
      { id: "buchim_beksul",         name: { ko: "백설 부침가루 1kg×10",                  de: "CJ-BEKSUL Pfannkuchen Mix 1kg x 10" },                      unit: "Ktn" },
      { id: "beksul_pflaumensirup",  name: { ko: "백설 매실청 1.025kg×9",                 de: "CJ-BEKSUL Pflaumensirup 1,025kg x 9" },                     unit: "Ktn" },
      { id: "gyoza_bibigo",          name: { ko: "비비고 교자 닭가슴살&5가지채소 600g×12", de: "CJ-BIBIGO Gyoza - Hähnchenbrust & 5 Gemüsesorten 600g x 12" }, unit: "Ktn" },
      { id: "doenjang_hcd",          name: { ko: "해찬들 된장 14kg",                      de: "CJ-HCD Bohnenpaste (Deonjang) 14kg" },                      unit: "Ktn" },
      { id: "gochujang_hcd",         name: { ko: "해찬들 고추장 14kg",                    de: "CJ-HCD Paprikapaste (gochujang) 14kg" },                    unit: "Ktn" },
      { id: "cooktok_tteokbokki",    name: { ko: "쿡톡 밀가루 떡볶이(L) 1kg×8",          de: "COOK-TOK Weizenmehl Tteokbokki (L) 1kg x 8" },              unit: "Ktn" },
      { id: "daesang_haehnchen",     name: { ko: "대상 달콤매운 치킨소스 10kg",            de: "DAESANG Süß Scharfe Hähnchensauce 10kg" },                  unit: "Kübel" },
      { id: "foison_shiitake",       name: { ko: "FOISON 표고버섯 3kg×5",                 de: "FOISON Shiitake Pilze 3kg x 5" },                           unit: "Ktn" },
      { id: "gaskocher",             name: { ko: "가스버너 EU (JY-500A-1) 1개×5",         de: "Gaskocher EU (JY-500A-1) 1stk x 5" },                       unit: "Ktn" },
      { id: "gosari",                name: { ko: "냉동 데친 고사리 1kg×10",               de: "Gefrorener Farn (Blanchiert) 1kg x 10" },                   unit: "Ktn" },
      { id: "fish_sauce",            name: { ko: "한성 멸치액젓 870ml×12",                de: "HANSUNG Fischsauce 870ml x 12" },                           unit: "Ktn" },
      { id: "gochugaru_suppe",       name: { ko: "임가네 고춧가루 수프용 1kg×10",          de: "IMGANE Paprikapulver für die Suppe 1kg x 10" },             unit: "Ktn" },
      { id: "gochugaru_kimchi",      name: { ko: "임가네 고춧가루 김치용 2.5kg×8",         de: "IMGANE Paprikapulver für Kimchi 2,5kg x 8" },               unit: "Ktn" },
      { id: "butangas",              name: { ko: "이나카 부탄가스 (CN) 227g×28",           de: "INAKA Butangas (CN) 227g x 28" },                           unit: "Ktn" },
      { id: "gyoza_inaka",           name: { ko: "이나카 교자 야채&닭 600g×10",           de: "INAKA Gyoza - Gemüse & Hähnchen 600g x 10" },               unit: "Ktn" },
      { id: "inaka_oshinko",         name: { ko: "이나카 무 오시코 1kg×15",               de: "INAKA Rettich Oshinko 1kg x 15" },                          unit: "Ktn" },
      { id: "jinro_fresh",           name: { ko: "진로 참이슬 후레쉬 16% 350ml×20",       de: "JINRO Chamisul Fresh 16% Alk. 350ml x 20" },                unit: "Ktn" },
      { id: "jinro_klassiker",       name: { ko: "진로 참이슬 클래식 20.1% 350ml×20",     de: "JINRO Chamisul Klassiker 20,1% Alk. 350ml x 20" },          unit: "Ktn" },
      { id: "tteok_jongga",          name: { ko: "종가집 떡볶이떡 1kg×5",                 de: "JONGA Tteokbokki 1kg x 5" },                                unit: "Ktn" },
      { id: "kadoya_sesamoel",       name: { ko: "KADOYA 참기름 1.65L×10",                de: "KADOYA Sesamöl 1,65L x 10" },                               unit: "Ktn" },
      { id: "rice_kimpo",            name: { ko: "김포 스시 쌀 9.07kg",                   de: "Kimpo Sushi Reis 9,07kg" },                                 unit: "Sack" },
      { id: "makgeolli",             name: { ko: "국순당 막걸리 6% 750ml×20",              de: "KOOKSOONDANG Reiswein (Makgeolli) 6% Alk. 750ml x 20" },   unit: "Ktn" },
      { id: "maaza_litschi",         name: { ko: "MAAZA 리치 음료 1L×12",                 de: "MAAZA Litschi Getränk 1L x 12" },                           unit: "Ktn" },
      { id: "mmd_injeolmi",          name: { ko: "명미당 흑임자 인절미 (40g×10)×20",      de: "MYUNG MI DANG Reiskuchen Schwarzer Sesam Injeolmi (40g x 10) x 20" }, unit: "Ktn" },
      { id: "aloe_1500",             name: { ko: "OKF 알로에킹 오리지널 1.5L×12",          de: "OKF Aloe King - Original 1.5L x 12" },                      unit: "Ktn" },
      { id: "aloe_500",              name: { ko: "OKF 알로에킹 오리지널 500ml×20",         de: "OKF Aloe King - Original 500ml x 20" },                     unit: "Ktn" },
      { id: "otsuka_miola",          name: { ko: "OTSUKA 쌀효소 (Miola) 1kg",             de: "OTSUKA Reis Enzym (Miola) 1kg" },                           unit: "Dose" },
      { id: "chicken_fry_ottogi",    name: { ko: "오뚜기 치킨튀김가루 1kg×10",            de: "OTTOGI Hähnchen Bratmischung 1kg x 10" },                   unit: "Ktn" },
      { id: "ottogi_ingwertee",      name: { ko: "오뚜기 생강차 1kg×9",                   de: "OTTOGI Ingwertee 1kg x 9" },                                unit: "Ktn" },
      { id: "ottogi_buchim",         name: { ko: "오뚜기 부침가루 500g×20",               de: "OTTOGI Pfannkuchenmischung 500g x 20" },                    unit: "Ktn" },
      { id: "tempura_ottogi",        name: { ko: "오뚜기 튀김가루 1kg×10",                de: "OTTOGI Tempurapulver 1kg x 10" },                           unit: "Ktn" },
      { id: "ottogi_zitronentee",    name: { ko: "오뚜기 레몬차 1kg×9",                   de: "OTTOGI Zitronentee 1kg x 9" },                              unit: "Ktn" },
      { id: "omegi_tteok",           name: { ko: "오메기떡 1.2kg×6",                      de: "Reiskuchen (Omegi) 1,2kg x 6" },                            unit: "Ktn" },
      { id: "samlip_jjajang",        name: { ko: "삼립 짜장면 (230g×5)×8",               de: "SAMLIP Jjajang Nudeln (230g x 5) x 8" },                    unit: "Ktn" },
      { id: "jjinppang",             name: { ko: "씨스토리 딤섬 샌드위치 만두 480g×16",   de: "SEASTORY Dimsum Sandwich Knödel 480g x 16" },               unit: "Ktn" },
      { id: "seastory_odeng_sq",     name: { ko: "씨스토리 어묵 사각 450g×20",            de: "SEASTORY Fischkuchen (Odeng) Quadratische 450g x 20" },     unit: "Ktn" },
      { id: "odeng_mix",             name: { ko: "씨스토리 어묵MIX 900g×12",              de: "SEASTORY Fischkuchen MIX (Odeng) 900g x 12" },              unit: "Ktn" },
      { id: "salz",                  name: { ko: "샘표 천일염 굵은 5kg×3",                de: "SEMPIO Meersalz (Sommer) Grob 5kg x 3" },                   unit: "Ktn" },
      { id: "soy_sauce",             name: { ko: "샘표 진간장 S 15L",                     de: "SEMPIO Sojasauce Jin S 15L" },                              unit: "Kübel" },
      { id: "yondu",                 name: { ko: "샘표 연두 라이트 275ml×12",              de: "SEMPIO Yondu Sauce - Light 275ml x 12" },                   unit: "Ktn" },
      { id: "talleys_muscheln",      name: { ko: "TALLEY'S 그린리프 홍합 800g×12",        de: "TALLEY'S Neuseeland Grünlippmuscheln 800g x 12" },          unit: "Ktn" },
      { id: "tomioka_tofu_inari",    name: { ko: "TOMIOKA 이나리 두부 (40개) 1kg×20",     de: "TOMIOKA Tofu für Inari Sushi (40stk) 1kg x 20" },          unit: "Ktn" }
    ],
  },
  {
    id: "zentral",
    name: { ko: "Akakiko Zentrale (웹 주문)", de: "Akakiko Zentrale (Webbestellung)" },
    channel: "web",
    color: "#2563EB",
    icon: "🌐",
    items: [
      { id: "almdudler_pet",        name: { ko: "Almdudler PET 24×0,5L",       de: "Almdudler PET 24x0,5L" },                         unit: "Tray" },
      { id: "aloe_gross",           name: { ko: "알로에베라 1.5L PET",          de: "Aloevera Groß 1.5L Pet" },                        unit: "Karton" },
      { id: "aloe_klein",           name: { ko: "알로에베라 0,5L PET",          de: "Aloevera klein 0,5L Pet" },                       unit: "Karton" },
      { id: "bankomat_rolle",       name: { ko: "카드단말기 영수증 롤",         de: "Bankomat Rolle" },                                unit: "Ktn" },
      { id: "becher_deckel_365",    name: { ko: "투명 컵+뚜껑 365ml",           de: "Becher mit Deckel 365ml Durchsichtig Ohne Logo" }, unit: "Karton" },
      { id: "bentobox_boden",       name: { ko: "벤토박스 바닥 (배달용)",       de: "Bentobox Boden Zustellung" },                     unit: "Packung" },
      { id: "bentobox_deckel",      name: { ko: "벤토박스 뚜껑 (배달용)",       de: "Bentobox Deckel Zustellung" },                    unit: "Packung" },
      { id: "bibimbap_sauce",       name: { ko: "비빔밥 소스 1L",              de: "Bibimbap Sauce 1L" },                             unit: "Eimer" },
      { id: "bier_cass",            name: { ko: "카스 맥주 24×330ml",           de: "Bier-Cass 24x330ml" },                            unit: "Karton" },
      { id: "bier_stiegl_dose",     name: { ko: "Stiegl 골드 캔 24×0,5L",      de: "Bier-Stiegl Goldbräu Dose 24x0,5L" },             unit: "Tray" },
      { id: "wein_portugieser",     name: { ko: "블라우어 포르투기저 레드와인",  de: "Blauer Portugieser (Krottendorfer)" },             unit: "Flasche" },
      { id: "bulgogi_sauce",        name: { ko: "불고기 소스 5L",               de: "Bulgogi Sauce 5L" },                              unit: "Eimer" },
      { id: "butangas",             name: { ko: "부탄가스 227g",                de: "Butangas 227g" },                                 unit: "Stück" },
      { id: "capsaicin_sauce",      name: { ko: "캡사이신 소스 550g",           de: "Capsaicin Sauce 550g" },                          unit: "Stück" },
      { id: "cola_pet",             name: { ko: "콜라 PET 24×0,5L",            de: "Cola PET 24x0,5L" },                              unit: "Tray" },
      { id: "cola_zero_pet",        name: { ko: "콜라 제로 PET 24×0,5L",       de: "Cola Zero PET 24x0,5L" },                         unit: "Tray" },
      { id: "dashida",              name: { ko: "다시다 소고기 2.25kg",          de: "Dashida Suppe Gewürze Rind 2,25kg" },             unit: "Packung" },
      { id: "dashinomoto",          name: { ko: "다시노모토 야마키 12kg",        de: "Dashinomoto Yamaki 12kg" },                       unit: "Karton" },
      { id: "duni_dimsum_box",      name: { ko: "Duni 딤섬 박스",               de: "Duni Dimsum Box 162303/162155" },                  unit: "Karton" },
      { id: "duni_fruehling",       name: { ko: "Duni 춘권 박스",              de: "Duni Frühlingsrolle box" },                       unit: "Ktn" },
      { id: "duni_reis_box",        name: { ko: "Duni 볶음밥 박스 171000",      de: "Duni Gebr.Reis Box 171000" },                     unit: "Karton" },
      { id: "duni_kyosa_box",       name: { ko: "Duni 교자 박스 758002",        de: "Duni Kyosa Box 758002" },                         unit: "Karton" },
      { id: "duni_siegelfolie",     name: { ko: "Duni 실링 필름",               de: "Duni Siegelfolie neu" },                          unit: "Rolle" },
      { id: "toilettenpapier",      name: { ko: "화장지 미니점보 12롤",          de: "Econatural Mini-Jumbo Toilettenpapier 2lagig 12 Rollen" }, unit: "Packung" },
      { id: "erdnuss",              name: { ko: "땅콩 900g",                    de: "Erdnuss 900g" },                                  unit: "Packung" },
      { id: "essig_egri",           name: { ko: "식초 5% 5L",                  de: "Essig 5L Tafel 5% Egri" },                        unit: "Kanister" },
      { id: "frischhaltefolie_30",  name: { ko: "랩 30cm",                     de: "Frischhaltefolie 30cm" },                         unit: "Stück" },
      { id: "frischhaltefolie_45",  name: { ko: "랩 45cm",                     de: "Frischhaltefolie 45cm" },                         unit: "Stück" },
      { id: "ganjeong_sauce",       name: { ko: "간장 소스 3L",                 de: "Ganjeong Sauce 3L" },                             unit: "Eimer" },
      { id: "glas_dessert",         name: { ko: "디저트 유리컵+뚜껑",           de: "Glas Dessert mit Deckel" },                       unit: "Stk" },
      { id: "toblerone",            name: { ko: "토블레론 (서비스)",            de: "Gratis Toblerone" },                              unit: "Ktn" },
      { id: "wein_veltliner",       name: { ko: "그뤼너 벨트리너 화이트와인 1L", de: "Grüner Veltliner Krottendorfer 1L (DP)" },        unit: "Flasche" },
      { id: "hoisin_sauce",         name: { ko: "호이신 소스 2.27L",            de: "Hoisin Sauce 2,27L" },                            unit: "Dose" },
      { id: "hoisin_lkk",           name: { ko: "호이신 소스 397g LKK",        de: "Hoisin Sauce 397g LKK" },                         unit: "Glas" },
      { id: "holzgabel",            name: { ko: "나무 포크",                   de: "Holzgabel" },                                     unit: "Packung" },
      { id: "holzloeffe",           name: { ko: "나무 숟가락",                  de: "Holzlöffel 187669" },                             unit: "Packung" },
      { id: "huehneroberkeule",     name: { ko: "닭 넓적다리살 2×2cm",         de: "Hühneroberkeule 2x2cm" },                         unit: "kg" },
      { id: "itame_box",            name: { ko: "이타메 박스 마쿠",             de: "Itame Box Maku" },                                unit: "Karton" },
      { id: "kaffeebecher",         name: { ko: "커피컵+뚜껑 대 50개",          de: "Kaffeebecher mit Deckel groß 50stk" },            unit: "Packung" },
      { id: "kartoffelmehl",        name: { ko: "감자전분 10kg",                de: "Kartoffelmehl 10kg" },                            unit: "Sack" },
      { id: "ketchup",              name: { ko: "케첩 Spak 10kg",              de: "Ketchup Spak 10kg" },                             unit: "Eimer" },
      { id: "knoblauch_granulat",   name: { ko: "마늘 분말",                   de: "Knoblauch Granulat" },                            unit: "Packung" },
      { id: "kor_chillipulver",     name: { ko: "한국 고춧가루",               de: "Koreanisch Chillipulver" },                       unit: "Packung" },
      { id: "kor_sojasauce",        name: { ko: "한국 간장 15L",               de: "Koreanische Sojasauce 15L" },                     unit: "Kanister" },
      { id: "kuechenbon",           name: { ko: "주방 영수증 롤",              de: "Küchenbon" },                                     unit: "Karton" },
      { id: "kuechenrollen",        name: { ko: "키친타월 12롤",               de: "Küchenrollen 12 Rollen" },                        unit: "Packung" },
      { id: "handschuhe_l",         name: { ko: "라텍스 장갑 L",               de: "Latex Handschuhe L" },                            unit: "Packung" },
      { id: "handschuhe_m",         name: { ko: "라텍스 장갑 M",               de: "Latex Handschuhe M" },                            unit: "Packung" },
      { id: "lemon_dressing",       name: { ko: "레몬 드레싱",                  de: "Lemon Dressing" },                                unit: "Eimer" },
      { id: "lychee_kompott",       name: { ko: "리치 콤포트 560g",            de: "Lycheekompott 560g" },                            unit: "Dose" },
      { id: "lychee_saft",          name: { ko: "리치 주스 12×1L",             de: "Lycheesaft 12x1L" },                              unit: "Karton" },
      { id: "mais_sirup",           name: { ko: "물엿 CJW 4×5kg",             de: "Mais-Sirup (CJW 4x5kg)" },                        unit: "Karton" },
      { id: "mirin",                name: { ko: "미림 18L",                    de: "Mirin 18L" },                                     unit: "Karton" },
      { id: "miso_wakame",          name: { ko: "미소 미역 와카메 500g",        de: "Miso Seetang Wakame 500g" },                      unit: "Packung" },
      { id: "morcheln",             name: { ko: "곰보버섯 1kg",                de: "Morcheln 1kg" },                                  unit: "Packung" },
      { id: "muellsack",            name: { ko: "쓰레기봉투 120L",             de: "Müllsack 120 Liter" },                            unit: "Rolle" },
      { id: "nori",                 name: { ko: "노리 김 2800g",               de: "Nori Ganz 2800g" },                               unit: "Karton" },
      { id: "oatly",                name: { ko: "오틀리 바리스타 귀리음료 1L",  de: "Oatly Barista Haferdrink 1 Liter" },              unit: "Packung" },
      { id: "omija_extract",        name: { ko: "오미자 원액 클래식 1500ml",    de: "Omija Extract classic 1500ml" },                  unit: "Flasche" },
      { id: "omija_beeren",         name: { ko: "건조 오미자열매",              de: "Omija-Beeren getrocknet" },                       unit: "Pkg" },
      { id: "oshinko",              name: { ko: "오시코 노란 단무지",           de: "Oshinko gelber Rettich" },                        unit: "Packung" },
      { id: "oyster_sauce",         name: { ko: "굴소스 4.5L",                 de: "Oyster Sauce 4,5L" },                             unit: "Kanister" },
      { id: "tragetasche_gross",    name: { ko: "종이 쇼핑백 대 250개",         de: "Papier Tragetasche groß Ohne Logo 250stk" },       unit: "Karton" },
      { id: "tragetasche_klein",    name: { ko: "종이 쇼핑백 소 250개",         de: "Papier Tragetasche klein Ohne Logo 250stk" },      unit: "Karton" },
      { id: "pfeffer_weiss",        name: { ko: "흰후추 1kg",                  de: "Pfeffer Weiß 1kg" },                              unit: "Packung" },
      { id: "prosecco",             name: { ko: "프로세코 0.2L HENKELL",       de: "Prosecco 0,2L HENKELL" },                         unit: "Flasche" },
      { id: "reis_bento",           name: { ko: "벤토 쌀 김포 9kg",            de: "Reis Bento Kimpo 9kg" },                          unit: "Sack" },
      { id: "rq_prickelnd_pet",     name: { ko: "Römerquelle 탄산 PET 24×0,5L", de: "Römerquelle prickelnd PET 24x0,5L" },           unit: "Tray" },
      { id: "rq_still_pet",         name: { ko: "Römerquelle 스틸 PET 24×0,5L", de: "Römerquelle still PET 24x0,5L" },               unit: "Tray" },
      { id: "salz_10kg",            name: { ko: "소금 10kg",                   de: "Salz 10kg" },                                     unit: "Eimer" },
      { id: "saucenbecher",         name: { ko: "소스컵+뚜껑 50ml 500개",      de: "Saucenbecher mit Deckel 50ml Plastik 500stk" },    unit: "Ktn" },
      { id: "servietten",           name: { ko: "냅킨 1/4",                    de: "Servietten 1/4" },                                unit: "Packung" },
      { id: "servietten_yori",      name: { ko: "요리2 점심 냅킨",             de: "Servietten Yori Mittag" },                        unit: "Karton" },
      { id: "sesam_weiss",          name: { ko: "볶은 흰깨 1kg",               de: "Sesam weiß geröstet 1kg" },                       unit: "Packung" },
      { id: "sesam_oel",            name: { ko: "참기름 Kadoya 1.65L×10",      de: "Sesam Öl Kadoya 1,65Liter x 10" },                unit: "Karton" },
      { id: "sesame_box",           name: { ko: "세사미 박스 마쿠",             de: "Sesame Box Maku" },                               unit: "Karton" },
      { id: "shiitake",             name: { ko: "표고버섯 3kg",                de: "Shitake Pilze 3kg" },                             unit: "Packung" },
      { id: "sodawasser",           name: { ko: "소다수 6×1L",                 de: "Sodawasser 6x1L" },                               unit: "Tray" },
      { id: "soja_flasche",         name: { ko: "소이 소스병 30ml 50개",       de: "Soja Plastik Flasche 30ml / 50stk" },             unit: "Packung" },
      { id: "soya_garlic",          name: { ko: "소야 갈릭 1L",                 de: "Soya Garlic 1L" },                                unit: "Eimer" },
      { id: "spicy_mayo",           name: { ko: "스파이시 마요 소스 1L",         de: "Spicy Mayo Sauce 1L" },                           unit: "Eimer" },
      { id: "sriracha",             name: { ko: "스리라차 소스",                de: "Sriracha Chilli Sauce" },                         unit: "Flasche" },
      { id: "staebchen_yori",       name: { ko: "요리2 젓가락",                de: "Stäbchen YORI" },                                 unit: "Karton" },
      { id: "tee_genmai",           name: { ko: "현미차 1kg",                  de: "Tee Genmai 1kg" },                                unit: "Packung" },
      { id: "tee_gruen",            name: { ko: "녹차 1kg",                    de: "Tee Grünen 1kg" },                                unit: "Packung" },
      { id: "tee_ingwer",           name: { ko: "생강꿀차 580g",               de: "Tee Ingwer Honing 580g" },                        unit: "Glas" },
      { id: "tee_jasmin",           name: { ko: "자스민차 500g",               de: "Tee Jasmin 500g" },                               unit: "Packung" },
      { id: "tee_yuzu",             name: { ko: "유자차 1kg",                  de: "Tee Yuzu 1kg" },                                  unit: "Stück" },
      { id: "tempura_mehl",         name: { ko: "튀김가루 10kg",               de: "Tempura Mehl 10kg" },                             unit: "Karton" },
      { id: "teriyaki_sauce",       name: { ko: "데리야끼 소스 10L",             de: "Teriyaki Sauce 10L" },                            unit: "Eimer" },
      { id: "tk_apple_kyosa",       name: { ko: "냉동 애플 교자",               de: "TK Apple Kyosa" },                                unit: "Karton" },
      { id: "tk_chicken_kyosa",     name: { ko: "냉동 치킨 교자",               de: "TK Chicken Kyosa" },                              unit: "Karton" },
      { id: "tk_tteokbokki",        name: { ko: "냉동 떡볶이 1kg",              de: "TK Deokbokki 1kg" },                              unit: "kg" },
      { id: "tk_ebi_fry",           name: { ko: "냉동 에비프라이 300g",          de: "TK Garnelen Ebi Fry Japanese Style 300g" },       unit: "Packung" },
      { id: "tk_gambas",            name: { ko: "냉동 새우 GAMBAS 13/15 대",    de: "TK Garnellen GAMBAS 13/15 groß" },                unit: "Packung" },
      { id: "tk_garnellen_31_40",   name: { ko: "냉동 껍질없는 새우 31/40",     de: "TK Garnellen ohne Schale 31/40" },                unit: "Packung" },
      { id: "tk_gua_bao",           name: { ko: "냉동 과바오 번",              de: "TK Gua Bao Buns" },                               unit: "Ktn" },
      { id: "tk_gyoza_ottogi",      name: { ko: "냉동 교자 오뚜기 건만두 800g", de: "TK Gyoza Gunmandu Ottogi 800g" },                 unit: "Ktn" },
      { id: "tk_gyoza_makumatsu",   name: { ko: "냉동 교자 마쿠마츠 10×600g",  de: "TK Gyoza Makumatsu 10x600g" },                    unit: "Karton" },
      { id: "tk_harumaki",          name: { ko: "냉동 하루마키",                de: "TK Harumaki" },                                   unit: "Karton" },
      { id: "tk_huehnerspies",      name: { ko: "냉동 닭꼬치 비비고",          de: "TK Hühnerspieße Bibigo April Menü" },             unit: "Ktn" },
      { id: "tk_jjajang",           name: { ko: "냉동 짜장면",                  de: "TK JJajang Nudeln" },                             unit: "Karton" },
      { id: "tk_kimmari",           name: { ko: "냉동 김말이",                  de: "TK Kimmari" },                                    unit: "Ktn" },
      { id: "tk_kimmari_300",       name: { ko: "냉동 김말이 300g×15",          de: "TK Kimmari 300g x 15" },                          unit: "Karton" },
      { id: "tk_knoblauch",         name: { ko: "냉동 마늘 5kg",                de: "TK Knoblauch 5kg" },                              unit: "Karton" },
      { id: "tk_mix_seafood",       name: { ko: "냉동 해산물 믹스 1kg",          de: "TK Mix Seafood 1kg" },                            unit: "Packung" },
      { id: "tk_mochi",             name: { ko: "냉동 모찌 4개",                de: "TK Mochi 4Stk" },                                 unit: "Packung" },
      { id: "tk_mochi_himbeer",     name: { ko: "냉동 모찌 아이스 라즈베리",    de: "TK Mochi Eis-Himbeer" },                          unit: "Packung" },
      { id: "tk_mochi_macha",       name: { ko: "냉동 모찌 아이스 말차",        de: "TK Mochi Eis-Macha" },                            unit: "Packung" },
      { id: "tk_mochi_mango",       name: { ko: "냉동 모찌 아이스 망고",        de: "TK Mochi Eis-Mango" },                            unit: "Packung" },
      { id: "tk_mousse_choco",      name: { ko: "냉동 초콜릿 무스 미니",        de: "TK Mousse au Chocolat Mini" },                    unit: "Dose" },
      { id: "tk_seetangsalat",      name: { ko: "냉동 해초 샐러드 2kg",         de: "TK Seetangsalat 2kg" },                           unit: "kg" },
      { id: "tk_spring_roll",       name: { ko: "냉동 스프링롤",                de: "TK Super Spring Roll" },                          unit: "Packung" },
      { id: "tk_brownie",           name: { ko: "냉동 브라우니 미니",            de: "TK Tasty Brownie Mini" },                         unit: "Dose" },
      { id: "unterlage_shabu",      name: { ko: "샤부 깔판 (요리2)",           de: "Unterlage Shabu (Yori 2)" },                      unit: "Karton" },
      { id: "vollei_mix",           name: { ko: "전란 믹스 1L 테트라팩",        de: "Vollei-Mix 1L TetraPak" },                        unit: "Liter" },
      { id: "zucker",               name: { ko: "설탕",                        de: "Zucker" },                                        unit: "kg" },
      { id: "sonnenblumenoel",      name: { ko: "해바라기씨유 10L",             de: "Öl Sonnenblumen 10 Liter" },                      unit: "Kanister" }
    ],
  },
  {
    // Stiegl: 2026 납품서 확인 완료
    id: "stiegl",
    name: { ko: "Stiegl (음료)", de: "Stiegl (Getränke)" },
    channel: "app",
    color: "#059669",
    icon: "🥤",
    items: [
      { id: "almdudler",             name: { ko: "Almdudler PET 0,50L×24",             de: "Almdudler PET EWP 0,50L/24" },               unit: "Kiste" },
      { id: "coca_cola_mw_033",      name: { ko: "코카콜라 0,33L×24 MW",               de: "Coca-Cola MW 0,33L/24" },                    unit: "Kiste" },
      { id: "coca_cola_pet",         name: { ko: "코카콜라 PET 0,50L×24",              de: "Coca-Cola PET EWP 0,50L/24" },               unit: "Kiste" },
      { id: "cola_zero_mw_033",      name: { ko: "코카콜라 제로 0,33L×24 MW",          de: "Coca-Cola Zero MW 0,33L/24" },               unit: "Kiste" },
      { id: "cola_zero_pet",         name: { ko: "코카콜라 제로 PET 0,50L×24",         de: "Coca-Cola Zero PET EWP 0,50L/24" },          unit: "Kiste" },
      { id: "franziskaner_033",      name: { ko: "Franziskaner 바이스 0,33L×24 MW",     de: "Franziskaner WB hell MW 0,33L/24" },         unit: "Kiste" },
      { id: "happyday_apfel",        name: { ko: "Happy Day 사과주스 100% 1,00L×12",   de: "Happy Day Apfelsaft 100% Tetra 1,00L/12" }, unit: "Kiste" },
      { id: "rq_prickelnd_033",      name: { ko: "Römerquelle 탄산 0,33L×20 MW",       de: "Römerquelle prickelnd MW 0,33L/20" },        unit: "Kiste" },
      { id: "rq_prickelnd_075",      name: { ko: "Römerquelle 탄산 0,75L×12 MW",       de: "Römerquelle prickelnd MW 0,75L/12" },        unit: "Kiste" },
      { id: "rq_still_033",          name: { ko: "Römerquelle 스틸 0,33L×20 MW",       de: "Römerquelle still MW 0,33L/20" },            unit: "Kiste" },
      { id: "rq_still_075",          name: { ko: "Römerquelle 스틸 0,75L×12 MW",       de: "Römerquelle still MW 0,75L/12" },            unit: "Kiste" },
      { id: "stiegl_alkfrei_033",    name: { ko: "Stiegl 무알콜 0,33L×24",             de: "Stiegl 0,0% alkoholfrei 0,33L/24" },         unit: "Kiste" },
      { id: "stiegl_gold_ds",        name: { ko: "Stiegl 골드 캔 0,50L 4×6",           de: "Stiegl-Gold DS 0,50L/4x6" },                 unit: "Kiste" },
      { id: "stiegl_gold_033",       name: { ko: "Stiegl 골드브로이 0,33L×24 MW",       de: "Stiegl-Goldbräu 0,33L/24" },                 unit: "Kiste" },
      { id: "stiegl_gold_05",        name: { ko: "Stiegl 골드브로이 0,50L×20 MW",       de: "Stiegl-Goldbräu 0,50L/20" },                 unit: "Kiste" },
      { id: "stiegl_para_033",       name: { ko: "Stiegl Bio-Zwickl 0,33L×24 MW",      de: "Stiegl-Paracelsus Bio-Zwickl 0,33L/24" },    unit: "Kiste" },
      { id: "stiegl_para_05",        name: { ko: "Stiegl Bio-Zwickl 0,50L×18 MW",      de: "Stiegl-Paracelsus Bio-Zwickl 0,50L/18" },    unit: "Kiste" },
      { id: "stiegl_radler_033",     name: { ko: "Stiegl 라들러 그레이프 0,33L×24",    de: "Stiegl-Radler Grapefruit 0,33L/24" },        unit: "Kiste" },
      { id: "stiegl_weisse_05",      name: { ko: "Stiegl 바이스 내추럴 0,50L×20 MW",    de: "Stiegl-Weisse Naturtrüb 0,50L/20" },         unit: "Kiste" }
    ],
  },
  {
    // Hua&Co: 2026 납품서 확인 결과 — 소스컵 30cc, 50cc, 소스병 15ml 확인
    id: "huaco",
    name: { ko: "Hua&Co (포장용품)", de: "Hua&Co (Verpackung)" },
    channel: "whatsapp",
    color: "#7C3AED",
    icon: "📦",
    items: [
      { id: "sauce_bottle_15", name: { ko: "소스병+뚜껑 15ml (20×100개)", de: "Saucebecher Flasche 15ml/20×100 Stk" }, unit: "Karton" },
      { id: "sauce_cup_30", name: { ko: "소스컵+뚜껑 30cc (20×50개)", de: "Saucebecher+Deckel R-30cc/20×50 Stk" }, unit: "Karton" },
      { id: "sauce_cup_50", name: { ko: "소스컵+뚜껑 50cc (20×50개)", de: "Saucebecher+Deckel R-50cc/20×50 Stk" }, unit: "Karton" }
    ],
  },
];

const CHANNEL_LABEL = {
  whatsapp: { ko: "WhatsApp", de: "WhatsApp", color: "#25D366" },
  kakao: { ko: "카카오톡", de: "KakaoTalk", color: "#FFCD00", textColor: "#333" },
  web: { ko: "웹사이트", de: "Webseite", color: "#2563EB" },
  app: { ko: "앱", de: "App", color: "#059669" },
};

// ── 유틸 ────────────────────────────────────────────────────────────────────
// 현지(기기) 시간 기준 YYYY-MM-DD — toISOString()은 UTC라 자정 무렵 날짜가 어긋남
function localDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function buildOrderMessage(supplier, quantities, lang, staffName, note) {
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  const orderedItems = supplier.items.filter(item => quantities[item.id] && quantities[item.id] > 0);
  if (!orderedItems.length) return null;

  if (supplier.id === "panasia") {
    const lines = orderedItems.map(item => `  • ${item.name[lang]}: ${quantities[item.id]} ${item.unit}`);
    if (lang === "ko") {
      return `📦 발주서 | ${dateStr}\n공급업체: ${supplier.name.ko}\n담당: ${staffName}\n\n${lines.join("\n")}${note ? `\n\n📝 메모: ${note}` : ""}`;
    }
    return `📦 Bestellung | ${dateStr}\nLieferant: ${supplier.name.de}\nMitarbeiter: ${staffName}\n\n${lines.join("\n")}${note ? `\n\n📝 Notiz: ${note}` : ""}`;
  }

  const header = `📦 Bestellung | ${dateStr}\nLieferant: ${supplier.name.de}\nMitarbeiter: ${staffName}`;
  const itemLines = orderedItems.map(item => `${item.name.de} ${quantities[item.id]}${item.unit}`).join("\n\n");
  const noteStr = note ? `\n\n📝 Notiz: ${note}` : "";
  return `${header}\n\nHallo für morgen Yori2 Stumpergasse 27 Bestellung\n\n${itemLines}${noteStr}\n\nLg`;
}



// ── 컴포넌트 ────────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("de");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showIosInstall, setShowIosInstall] = useState(false);
  const [swWaiting, setSwWaiting] = useState(null); // service worker waiting to activate
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("yori2_user") || "null"); } catch { return null; }
  });
  const currentUserRef = useRef(currentUser); // 실시간 콜백에서 최신 사용자 참조용
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [page, _setPage] = useState(() => localStorage.getItem("yori2_page") || "home");
  const setPage = (p) => { _setPage(p); localStorage.setItem("yori2_page", p); };
  const pageRef = useRef(page); // 실시간 콜백에서 현재 페이지 참조용
  useEffect(() => { pageRef.current = page; }, [page]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [note, setNote] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(null);
  const [itemSearch, setItemSearch] = useState("");
  // owner password popup
  const [pwPopup, setPwPopup] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [pendingUser, setPendingUser] = useState(null);
  const [ownerPw, setOwnerPw] = useState(""); // 직원관리 RPC 인증용 (메모리에만 보관)
  // owner settings state
  const [suppliers, setSuppliers] = useState([]);
  const [suppliersLoading, setSuppliersLoading] = useState(true);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [newSupplierForm, setNewSupplierForm] = useState({name_ko:"",name_de:"",channel:"whatsapp",icon:"📦",color:"#888888"});
  const [newItemForm, setNewItemForm] = useState({name_ko:"",name_de:"",unit:""});
  const [settingsView, setSettingsView] = useState("list");
  const [supplierNoteDraft, setSupplierNoteDraft] = useState(""); // 업체별 발주 안내 메모
  const [noteSaved, setNoteSaved] = useState(false);
  // staff management
  const [staffUsers, setStaffUsers] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({email:"", name:""});
  const [staffError, setStaffError] = useState("");
  // manual
  const MANUAL_ROOT_ID = "368cbee4b25880da883adcab9d9ca5c1";
  const MANUAL_HIDDEN_IDS = ["368cbee4-b258-81ff-8f09-cae9de48610b"];
  const [manualBlocks, setManualBlocks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("yori2_manual_cache") || "[]"); } catch { return []; }
  });
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState("");
  const [manualStack, setManualStack] = useState([]); // [{id, title, viewType}]
  const [manualTitle, setManualTitle] = useState("메뉴얼");
  const [manualViewType, setManualViewType] = useState("blocks"); // "blocks" | "database"
  const [currentManualId, setCurrentManualId] = useState(null);
  const [dbSearch, setDbSearch] = useState("");
  const [dbCategory, setDbCategory] = useState("");
  const manualReqRef = useRef(0); // 메뉴얼 비동기 로드 경쟁 방지 토큰
  // announce & notes
  const [announcements, setAnnouncements] = useState([]);
  const [dailyNotes, setDailyNotes] = useState([]);
  const [newAnnounceText, setNewAnnounceText] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [lastReadAnnounce, setLastReadAnnounce] = useState(() => localStorage.getItem("yori2_read_announce") || "");
  const [lastReadNotes, setLastReadNotes] = useState(() => localStorage.getItem("yori2_read_notes") || "");
  const [announceAlert, setAnnounceAlert] = useState(null); // 새 공지 실시간 팝업 (확인 전까지 유지)
  const [notifPerm, setNotifPerm] = useState(() => ("Notification" in window) ? Notification.permission : "unsupported");
  const [pushOn, setPushOn] = useState(false); // 이 기기 푸시 구독 등록 완료 여부
  // schedule
  const [scheduleData, setScheduleData] = useState(() => {
    try {
      const c = JSON.parse(localStorage.getItem("yori2_schedule_cache") || "null");
      return (c && c.monthIdx === new Date().getMonth()) ? c.data : null;
    } catch { return null; }
  });
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [scheduleSelectedMonth, setScheduleSelectedMonth] = useState(new Date().getMonth());
  const [scheduleWeekIndex, setScheduleWeekIndex] = useState(() => {
    try {
      const c = JSON.parse(localStorage.getItem("yori2_schedule_cache") || "null");
      if (!c || c.monthIdx !== new Date().getMonth()) return 0;
      const today = new Date();
      const idx = c.data.weeks.findIndex(w => w.dates.some(d => d.day === today.getDate() && d.month === today.getMonth() + 1));
      return idx >= 0 ? idx : 0;
    } catch { return 0; }
  });

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/yori2-order-app/sw.js").then(reg => {
      const onUpdateFound = () => {
        const newSw = reg.installing;
        if (!newSw) return;
        newSw.addEventListener("statechange", () => {
          if (newSw.state === "installed" && navigator.serviceWorker.controller) {
            setSwWaiting(newSw);
          }
        });
      };
      reg.addEventListener("updatefound", onUpdateFound);
      if (reg.waiting && navigator.serviceWorker.controller) setSwWaiting(reg.waiting);
    }).catch(err => console.warn("SW registration failed:", err));

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) { refreshing = true; window.location.reload(); }
    });
  }, []);

  // 새로고침 시에도 루트 메뉴얼을 최신화 (캐시 먼저 표시 후 백그라운드 갱신)
  useEffect(() => {
    if (currentUser) loadManualPage(MANUAL_ROOT_ID, "메뉴얼", null);
  }, []);

  useEffect(() => {
    const mapRow = row => ({
      id: row.id,
      date: row.date,
      staffName: row.staff_name,
      staffEmail: row.staff_email,
      supplier: row.supplier,
      supplierName: row.supplier_name,
      channel: row.channel,
      quantities: row.quantities,
      note: row.note,
      message: row.message,
      status: row.status,
    });

    supabase
      .from("orders")
      .select("*")
      .order("date", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("Supabase fetch error:", error);
        if (!error && data) setOrders(data.map(mapRow));
        setOrdersLoading(false);
      });

    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, payload => {
        if (payload.eventType === "INSERT") {
          setOrders(prev => prev.some(o => o.id === payload.new.id) ? prev : [mapRow(payload.new), ...prev]);
        } else if (payload.eventType === "UPDATE") {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? mapRow(payload.new) : o));
        } else if (payload.eventType === "DELETE") {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []); // orders

  useEffect(() => {
    supabase.from("suppliers").select("*").then(({ data, error }) => {
      if (error) { console.error("Supabase suppliers fetch error:", error); setSuppliersLoading(false); return; }
      if (data && data.length > 0) {
        setSuppliers(data.map(row => ({ id: row.id, name: row.name, channel: row.channel, icon: row.icon, color: row.color, items: row.items })));
        setSuppliersLoading(false);
      } else {
        const seed = SUPPLIERS.map((s, i) => ({ id: s.id, name: s.name, channel: s.channel, icon: s.icon, color: s.color, sort_order: i, items: s.items }));
        supabase.from("suppliers").insert(seed).then(({ error: e }) => {
          if (e) console.error("Supabase suppliers seed error:", e);
          else setSuppliers(SUPPLIERS);
          setSuppliersLoading(false);
        });
      }
    });
  }, []); // suppliers

  useEffect(() => {
    supabase.from("announcements").select("*").order("created_at", {ascending: false})
      .then(({ data, error }) => { if (error) console.error("Fetch announcements:", error); if (data) setAnnouncements(data); });
    supabase.from("daily_notes").select("*").order("created_at", {ascending: false})
      .then(({ data, error }) => { if (error) console.error("Fetch daily_notes:", error); if (data) setDailyNotes(data); });
    const ch1 = supabase.channel("announce-rt")
      .on("postgres_changes", {event: "*", schema: "public", table: "announcements"}, payload => {
        if (payload.eventType === "INSERT") {
          setAnnouncements(prev => prev.some(a => a.id === payload.new.id) ? prev : [payload.new, ...prev]);
          if (payload.new.author_name !== currentUserRef.current?.name) {
            if (pageRef.current === "announce") markAnnounceRead(); // 이미 공지 화면을 보는 중이면 바로 읽음 처리
            else notifyAnnounce(payload.new);
          }
        }
        else if (payload.eventType === "DELETE") setAnnouncements(prev => prev.filter(a => a.id !== payload.old.id));
      }).subscribe();
    const ch2 = supabase.channel("notes-rt")
      .on("postgres_changes", {event: "*", schema: "public", table: "daily_notes"}, payload => {
        if (payload.eventType === "INSERT") setDailyNotes(prev => prev.some(n => n.id === payload.new.id) ? prev : [payload.new, ...prev]);
        else if (payload.eventType === "DELETE") setDailyNotes(prev => prev.filter(n => n.id !== payload.old.id));
      }).subscribe();
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
  }, []); // announce & notes

  function syncSupplierToDb(supplier) {
    supabase.from("suppliers").upsert({ id: supplier.id, name: supplier.name, channel: supplier.channel, icon: supplier.icon, color: supplier.color, items: supplier.items })
      .then(({ error }) => { if (error) console.error("Supabase supplier sync error:", error); });
  }

  const t = (ko, de) => lang === "ko" ? ko : de;

  async function loadStaff() {
    setStaffLoading(true);
    const { data, error } = await supabase.from("users_public").select("id, email, name, role").order("role", { ascending: false });
    if (!error && data) setStaffUsers(data);
    setStaffLoading(false);
  }

  function getOwnerPw() {
    if (ownerPw) return ownerPw;
    const p = window.prompt(t("사장님 비밀번호를 입력하세요", "Inhaber-Passwort eingeben")) || "";
    if (p) setOwnerPw(p);
    return p;
  }

  // RPC 미설치(마이그레이션 전) 환경에서는 기존 직접 쿼리로 동작
  const isRpcMissing = (error) => error.code === "42883" || error.code === "PGRST202";

  async function handleAddStaff() {
    if (!newStaffForm.email.trim() || !newStaffForm.name.trim()) return;
    setStaffError("");
    const pw = getOwnerPw();
    if (!pw) return;
    let { error } = await supabase.rpc("add_staff", {
      p_owner_email: currentUser.email,
      p_owner_password: pw,
      p_email: newStaffForm.email.trim().toLowerCase(),
      p_name: newStaffForm.name.trim(),
    });
    if (error && isRpcMissing(error)) {
      ({ error } = await supabase.from("users").insert({
        email: newStaffForm.email.trim().toLowerCase(),
        name: newStaffForm.name.trim(),
        role: "staff"
      }));
    }
    if (error) {
      if (error.message?.includes("unauthorized")) {
        setOwnerPw("");
        setStaffError(t("비밀번호가 틀렸습니다.", "Falsches Passwort."));
      } else {
        setStaffError(error.code === "23505"
          ? t("이미 등록된 이메일입니다.", "E-Mail bereits registriert.")
          : t("오류가 발생했습니다.", "Ein Fehler ist aufgetreten."));
      }
      return;
    }
    setNewStaffForm({email:"", name:""});
    loadStaff();
  }

  const NOTION_PROXY = "https://oitrivgffkdhkedhydqw.supabase.co/functions/v1/notion-proxy";

  async function fetchBlocks(blockId) {
    const res = await fetch(NOTION_PROXY + "?page_id=" + blockId + "&type=blocks", {
      headers: { "Authorization": "Bearer " + SUPABASE_ANON_KEY, "apikey": SUPABASE_ANON_KEY },
      cache: "no-store",
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    return data.results || [];
  }

  async function loadManualPage(pageId, title, pushStack) {
    const req = ++manualReqRef.current; // 이 호출의 토큰
    setManualError("");

    // 캐시가 있으면 즉시 표시
    const cacheKey = "yori2_page_" + pageId;
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached) {
        if (pushStack) setManualStack(prev => [...prev, pushStack]);
        setManualBlocks(cached);
        setManualTitle(title);
        setManualViewType("blocks");
        setCurrentManualId(pageId);
        setManualLoading(false);
        // 백그라운드에서 최신 데이터 fetch 후 업데이트
        fetchAndUpdatePage(pageId, title, cacheKey, req);
        return;
      }
    } catch (_) {}

    // 캐시 없으면 정상 로딩
    setManualLoading(true);
    try {
      const blocks = await fetchPageBlocks(pageId);
      if (req !== manualReqRef.current) return; // 그새 다른 페이지로 이동 → 폐기
      if (pushStack) setManualStack(prev => [...prev, pushStack]);
      setManualBlocks(blocks);
      setManualTitle(title);
      setManualViewType("blocks");
      setCurrentManualId(pageId);
      try { localStorage.setItem(cacheKey, JSON.stringify(blocks)); } catch (_) {}
      if (!pushStack) {
        try { localStorage.setItem("yori2_manual_cache", JSON.stringify(blocks)); } catch (_) {}
      }
    } catch (e) {
      if (req === manualReqRef.current) setManualError(e.message);
    }
    if (req === manualReqRef.current) setManualLoading(false);
  }

  async function fetchPageBlocks(pageId) {
    const topBlocks = await fetchBlocks(pageId);
    const blocks = topBlocks.filter(b => !MANUAL_HIDDEN_IDS.includes(b.id));
    const withChildren = blocks.filter(b => b.has_children);
    if (withChildren.length > 0) {
      const childArrays = await Promise.all(
        withChildren.map(b => fetchBlocks(b.id).catch(() => []))
      );
      withChildren.forEach((b, i) => { b._children = childArrays[i]; });
      const level2 = withChildren.flatMap(b => (b._children || []).filter(c => c.has_children));
      if (level2.length > 0) {
        const grandArrays = await Promise.all(
          level2.map(b => fetchBlocks(b.id).catch(() => []))
        );
        level2.forEach((b, i) => { b._children = grandArrays[i]; });
      }
    }
    return blocks;
  }

  async function fetchAndUpdatePage(pageId, title, cacheKey, req) {
    try {
      const blocks = await fetchPageBlocks(pageId);
      // 사용자가 그새 다른 페이지로 이동했으면 화면은 건드리지 않고 캐시만 갱신
      const stillCurrent = req === undefined || req === manualReqRef.current;
      if (stillCurrent) setManualBlocks(blocks);
      try { localStorage.setItem(cacheKey, JSON.stringify(blocks)); } catch (_) {}
      if (pageId === MANUAL_ROOT_ID) {
        try { localStorage.setItem("yori2_manual_cache", JSON.stringify(blocks)); } catch (_) {}
      }
    } catch (_) {}
  }

  async function fetchDatabasePages(dbId) {
    const res = await fetch(NOTION_PROXY + "?page_id=" + dbId + "&type=database", {
      headers: { "Authorization": "Bearer " + SUPABASE_ANON_KEY, "apikey": SUPABASE_ANON_KEY },
      cache: "no-store",
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { throw new Error("응답 파싱 실패: " + text.slice(0, 100)); }
    if (!res.ok) throw new Error("HTTP " + res.status + ": " + (data.message || data.error || text.slice(0, 100)));
    if (data.object === "error") throw new Error("Notion: " + data.message);
    return data.results || [];
  }

  async function loadDatabase(dbId, title, pushStack) {
    const req = ++manualReqRef.current; // 이 호출의 토큰
    setManualError("");
    const cacheKey = "yori2_db_" + dbId;

    // 캐시 있으면 즉시 표시
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey) || "null");
      if (cached) {
        if (pushStack) setManualStack(prev => [...prev, pushStack]);
        setManualBlocks(cached);
        setManualTitle(title);
        setManualViewType("database");
        setCurrentManualId(dbId);
        setDbSearch("");
        setDbCategory("");
        setManualLoading(false);
        // 백그라운드 최신화 (그새 이동했으면 화면은 건드리지 않음)
        fetchDatabasePages(dbId).then(pages => {
          if (req === manualReqRef.current) setManualBlocks(pages);
          try { localStorage.setItem(cacheKey, JSON.stringify(pages)); } catch (_) {}
        }).catch(() => {});
        return;
      }
    } catch (_) {}

    // 캐시 없으면 정상 로딩
    setManualLoading(true);
    try {
      const pages = await fetchDatabasePages(dbId);
      if (req !== manualReqRef.current) return; // 그새 다른 페이지로 이동 → 폐기
      if (pushStack) setManualStack(prev => [...prev, pushStack]);
      setManualBlocks(pages);
      setManualTitle(title);
      setManualViewType("database");
      setCurrentManualId(dbId);
      setDbSearch("");
      setDbCategory("");
      try { localStorage.setItem(cacheKey, JSON.stringify(pages)); } catch (_) {}
    } catch (e) {
      if (req === manualReqRef.current) setManualError(e.message);
    }
    if (req === manualReqRef.current) setManualLoading(false);
  }

  function manualGoBack() {
    if (manualStack.length === 0) return;
    const prev = manualStack[manualStack.length - 1];
    setManualStack(manualStack.slice(0, -1));
    setManualBlocks([]);
    if (prev.viewType === "database") {
      loadDatabase(prev.id, prev.title, null);
    } else {
      loadManualPage(prev.id, prev.title, null);
    }
  }

  function extractNotionId(url) {
    try {
      const u = new URL(url);
      if (!u.hostname.includes("notion")) return null;
      const seg = u.pathname.split("/").pop() || "";
      const m = seg.match(/([0-9a-f]{32})$/i) || seg.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
      return m ? m[1].replace(/-/g, "") : null;
    } catch { return null; }
  }

  function renderNotionBlock(block) {
    try { return renderNotionBlockInner(block); }
    catch (e) { console.warn("block render skipped:", block?.type, e); return null; }
  }

  function renderNotionBlockInner(block) {
    const rt = (richText) => richText?.map((r, i) => {
      let style = {};
      if (r.annotations?.bold) style.fontWeight = "700";
      if (r.annotations?.italic) style.fontStyle = "italic";
      if (r.annotations?.underline) style.textDecoration = "underline";
      if (r.annotations?.strikethrough) style.textDecoration = "line-through";
      if (r.annotations?.code) {
        style.fontFamily = "monospace";
        style.background = "#1a1a2e";
        style.padding = "1px 5px";
        style.borderRadius = 3;
        style.fontSize = 12;
      }
      if (r.annotations?.color && r.annotations.color !== "default") style.color = "#f5a623";

      if (r.type === "mention" && r.mention?.type === "page") {
        if (MANUAL_HIDDEN_IDS.includes(r.mention.page.id)) return null;
        return (
          <span key={i} style={{color:"#7b8cde",textDecoration:"underline",cursor:"pointer",...style}}
            onClick={() => loadManualPage(r.mention.page.id, r.plain_text, {id: currentManualId || MANUAL_ROOT_ID, title: manualTitle, viewType: "blocks"})}>
            {r.plain_text}
          </span>
        );
      }
      if (r.href) {
        const notionId = extractNotionId(r.href);
        if (notionId && !MANUAL_HIDDEN_IDS.includes(notionId)) {
          return (
            <span key={i} style={{color:"#7b8cde",textDecoration:"underline",cursor:"pointer",...style}}
              onClick={() => loadManualPage(notionId, r.plain_text, {id: currentManualId || MANUAL_ROOT_ID, title: manualTitle, viewType: "blocks"})}>

              {r.plain_text}
            </span>
          );
        }
        return (
          <a key={i} href={r.href} target="_blank" rel="noopener noreferrer"
            style={{color:"#7b8cde",textDecoration:"underline",...style}}>
            {r.plain_text}
          </a>
        );
      }
      return <span key={i} style={style}>{r.plain_text}</span>;
    });

    switch (block.type) {
      case "heading_1": return (
        <div key={block.id} style={{fontSize:18,fontWeight:700,color:"#e8e8f0",margin:"18px 0 8px",borderBottom:"1px solid #2a2a3e",paddingBottom:6}}>
          {rt(block.heading_1.rich_text)}
        </div>
      );
      case "heading_2": return (
        <div key={block.id} style={{fontSize:15,fontWeight:700,color:"#c8c8d8",margin:"14px 0 6px"}}>
          {rt(block.heading_2.rich_text)}
        </div>
      );
      case "heading_3": return (
        <div key={block.id} style={{fontSize:13,fontWeight:700,color:"#a8a8c8",margin:"10px 0 4px"}}>
          {rt(block.heading_3.rich_text)}
        </div>
      );
      case "paragraph": return (
        <div key={block.id} style={{fontSize:13,color:"#b0b0c8",lineHeight:1.6,marginBottom:6}}>
          {rt(block.paragraph.rich_text) || <br/>}
          {block._children?.map(c => renderNotionBlock(c))}
        </div>
      );
      case "bulleted_list_item": return (
        <div key={block.id} style={{fontSize:13,color:"#b0b0c8",lineHeight:1.6,marginBottom:4,paddingLeft:16}}>
          <div style={{display:"flex",gap:6}}><span style={{color:"#555"}}>•</span><span>{rt(block.bulleted_list_item.rich_text)}</span></div>
          {block._children?.map(c => renderNotionBlock(c))}
        </div>
      );
      case "numbered_list_item": return (
        <div key={block.id} style={{fontSize:13,color:"#b0b0c8",lineHeight:1.6,marginBottom:4,paddingLeft:16}}>
          <div>{rt(block.numbered_list_item.rich_text)}</div>
          {block._children?.map(c => renderNotionBlock(c))}
        </div>
      );
      case "divider": return (
        <div key={block.id} style={{borderTop:"1px solid #2a2a3e",margin:"12px 0"}}/>
      );
      case "child_page": if (MANUAL_HIDDEN_IDS.includes(block.id)) return null;
        return (
        <div key={block.id}
          onClick={() => loadManualPage(block.id, block.child_page.title, {id: currentManualId || MANUAL_ROOT_ID, title: manualTitle, viewType: "blocks"})}
          style={{...styles.historyCard, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8, cursor:"pointer"}}>
          <div style={{fontWeight:600,fontSize:13,color:"#e8e8f0"}}>📄 {block.child_page.title}</div>
          <div style={{color:"#555",fontSize:18}}>›</div>
        </div>
      );
      case "child_database": if (MANUAL_HIDDEN_IDS.includes(block.id)) return null;
        return (
        <div key={block.id}
          onClick={() => loadDatabase(block.id, block.child_database.title, {id: currentManualId || MANUAL_ROOT_ID, title: manualTitle, viewType: "blocks"})}
          style={{...styles.historyCard, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8, cursor:"pointer"}}>
          <div style={{fontWeight:600,fontSize:13,color:"#e8e8f0"}}>🗄️ {block.child_database.title}</div>
          <div style={{color:"#555",fontSize:18}}>›</div>
        </div>
      );
      case "callout": return (
        <div key={block.id} style={{background:"#1e1e2e",border:"1px solid #2a2a3e",borderRadius:8,padding:"10px 12px",marginBottom:8,fontSize:13,color:"#b0b0c8"}}>
          {block.callout.icon?.emoji} {rt(block.callout.rich_text)}
        </div>
      );
      case "image": {
        const url = block.image?.external?.url || block.image?.file?.url || "";
        const caption = block.image?.caption?.map(r => r.plain_text).join("") || "";
        return url ? (
          <div key={block.id} style={{margin:"10px 0",textAlign:"center"}}>
            <img src={url} alt={caption}
              style={{maxWidth:"100%",borderRadius:8,border:"1px solid #2a2a3e"}}
              onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="block"; }}
            />
            <div style={{display:"none",fontSize:12,color:"#666",padding:8}}>🖼️ 이미지를 불러올 수 없습니다</div>
            {caption && <div style={{fontSize:11,color:"#666",marginTop:4}}>{caption}</div>}
          </div>
        ) : null;
      }
      case "toggle": return (
        <details key={block.id} style={{marginBottom:6}}>
          <summary style={{fontSize:13,color:"#b0b0c8",cursor:"pointer",padding:"2px 0",listStyle:"none",display:"flex",alignItems:"center",gap:6}}>
            <span style={{color:"#555",fontSize:10}}>▶</span>
            <span>{rt(block.toggle?.rich_text)}</span>
          </summary>
          <div style={{paddingLeft:16,marginTop:4}}>
            {block._children?.map(c => renderNotionBlock(c))}
          </div>
        </details>
      );
      case "column_list": return (
        <div key={block.id} style={{display:"flex",flexDirection:"column",gap:8,marginBottom:8}}>
          {block._children?.map(c => renderNotionBlock(c))}
        </div>
      );
      case "column": return (
        <div key={block.id} style={{width:"100%"}}>
          {block._children?.map(c => renderNotionBlock(c))}
        </div>
      );
      case "to_do": return (
        <div key={block.id} style={{fontSize:13,color:"#b0b0c8",lineHeight:1.6,marginBottom:4,paddingLeft:4,display:"flex",gap:8,alignItems:"flex-start"}}>
          <span style={{color: block.to_do.checked ? "#7b8cde" : "#444", fontSize:15}}>
            {block.to_do.checked ? "☑" : "☐"}
          </span>
          <span style={{textDecoration: block.to_do.checked ? "line-through" : "none", opacity: block.to_do.checked ? 0.5 : 1}}>
            {rt(block.to_do.rich_text)}
          </span>
        </div>
      );
      case "quote": return (
        <div key={block.id} style={{borderLeft:"3px solid #7b8cde",paddingLeft:12,margin:"8px 0",fontSize:13,color:"#888",fontStyle:"italic"}}>
          {rt(block.quote.rich_text)}
        </div>
      );
      case "table": return (
        <div key={block.id} style={{overflowX:"auto",marginBottom:12}}>
          <table style={{borderCollapse:"collapse",fontSize:12,color:"#b0b0c8",width:"100%"}}>
            <tbody>
              {(block._children || []).map((row, ri) => (
                <tr key={row.id}>
                  {(row.table_row?.cells || []).map((cell, ci) => {
                    const Tag = block.table.has_column_header && ri === 0 ? "th" : "td";
                    return (
                      <Tag key={ci} style={{border:"1px solid #2a2a3e",padding:"6px 10px",textAlign:"left",background: block.table.has_column_header && ri === 0 ? "#1e1e30" : "transparent",fontWeight: block.table.has_column_header && ri === 0 ? 600 : 400}}>
                        {rt(cell)}
                      </Tag>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      case "link_to_page": {
        const lpId = block.link_to_page?.page_id || block.link_to_page?.database_id || "";
        if (!lpId || MANUAL_HIDDEN_IDS.includes(lpId)) return null;
        return (
          <div key={block.id}
            onClick={() => loadManualPage(lpId, "페이지", {id: currentManualId || MANUAL_ROOT_ID, title: manualTitle, viewType: "blocks"})}
            style={{...styles.historyCard, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8, cursor:"pointer"}}>
            <div style={{fontWeight:600,fontSize:13,color:"#7b8cde"}}>🔗 {block.link_to_page?.page_id ? "페이지 링크" : "데이터베이스 링크"}</div>
            <div style={{color:"#555",fontSize:18}}>›</div>
          </div>
        );
      }
      default: return null;
    }
  }

  const SCHEDULE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwCuAzLs9Q21J3clBQpmmuV5FAfIKp5Ict9SqlaL1T_mIWbC2gKC4ZSUTuDGrz573QI/exec";
  const MONTH_DE = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];

  function isRedColor(hex) {
    if (!hex || hex === "#000000" || hex === "#ffffff" || hex === "null") return false;
    const r = parseInt(hex.slice(1,3), 16);
    const g = parseInt(hex.slice(3,5), 16);
    const b = parseInt(hex.slice(5,7), 16);
    return r > 150 && g < 100 && b < 100;
  }

  function parseScheduleData(data) {
    const rows = data.rows.map(r => ({ v: r.v, f: r.f || [] }));

    const dayRowIdx = rows.findIndex(r => r.v.filter(c => c === "MO").length >= 2);
    if (dayRowIdx < 0) return null;
    const dateRow = rows[dayRowIdx + 1];
    // 요일/날짜 행 위의 행들 = 특별 일정 메모 (예: PM = Personal Meeting)
    const memoRows = rows.slice(0, dayRowIdx);
    const isNoiseCell = (s) => /^(19|20)\d\d$/.test(s) || MONTH_DE.includes(s);

    const staffRows = [];
    for (let i = dayRowIdx + 2; i < rows.length; i++) {
      const name = rows[i].v[0]?.trim();
      if (name && name !== "F" && name !== "=" && !/^\d/.test(name)) {
        staffRows.push({ name, v: rows[i].v });
      }
    }

    const weeks = [];
    const sheetMonth = MONTH_DE.indexOf(dateRow.v[0]) + 1 || new Date().getMonth() + 1;
    const firstDateNum = parseInt(dateRow.v[1]) || 0;
    // 첫 날짜가 20 이상이면 이전 달 날짜 (예: Mai 시트에서 4월 27일부터 시작)
    let curMonth = firstDateNum > 20 ? (sheetMonth === 1 ? 12 : sheetMonth - 1) : sheetMonth;
    let prevDate = 0;

    for (let startCol = 1; startCol < (dateRow.v.length - 1); startCol += 8) {
      const dates = [];
      for (let d = 0; d < 7; d++) {
        const dayNum = parseInt(dateRow.v[startCol + d]) || 0;
        if (dayNum < prevDate && prevDate > 20) curMonth = curMonth % 12 + 1;
        prevDate = dayNum || prevDate;
        const dayColor = rows[dayRowIdx].f[startCol + d] || "#000000";
        const dateColor = dateRow.f[startCol + d] || "#000000";
        const isWeekend = d >= 5; // SA=5, SO=6
        const isHoliday = !isWeekend && (isRedColor(dayColor) || isRedColor(dateColor));
        const memo = memoRows
          .map(r => String(r.v[startCol + d] ?? "").trim())
          .filter(s => s && !isNoiseCell(s))
          .join(" / ");
        dates.push({ day: dayNum, month: curMonth, isHoliday, memo });
      }
      if (dates.every(d => !d.day)) break;

      const staff = {};
      staffRows.forEach(s => {
        staff[s.name] = [];
        for (let d = 0; d < 7; d++) staff[s.name].push(s.v[startCol + d] || "");
      });
      weeks.push({ dates, staff });
    }
    return { staffNames: staffRows.map(s => s.name), weeks };
  }

  async function loadSchedule(monthIdx) {
    // 같은 달 캐시가 이미 보이는 중이면 로딩 화면 없이 백그라운드로 갱신
    const hasCache = scheduleData && scheduleSelectedMonth === monthIdx;
    if (!hasCache) setScheduleLoading(true);
    setScheduleError("");
    setScheduleSelectedMonth(monthIdx);
    const sheet = MONTH_DE[monthIdx];
    try {
      const res = await fetch(`${SCHEDULE_SCRIPT_URL}?month=${encodeURIComponent(sheet)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const parsed = parseScheduleData(data);
      if (!parsed) throw new Error("파싱 실패");
      try { localStorage.setItem("yori2_schedule_cache", JSON.stringify({ monthIdx, data: parsed })); } catch (_) {}
      setScheduleData(parsed);
      const today = new Date();
      const idx = parsed.weeks.findIndex(w => w.dates.some(d => d.day === today.getDate() && d.month === today.getMonth() + 1));
      setScheduleWeekIndex(idx >= 0 ? idx : 0);
    } catch (e) {
      console.error("Schedule fetch error:", e);
      setScheduleError(`${t("불러오기 실패","Ladefehler")}: ${e.message}`);
    }
    setScheduleLoading(false);
  }

  async function handleRemoveStaff(user) {
    if (user.role === "owner") return;
    if (!window.confirm(t(`"${user.name}"을(를) 삭제하시겠습니까?`, `"${user.name}" löschen?`))) return;
    const pw = getOwnerPw();
    if (!pw) return;
    let { error } = await supabase.rpc("remove_staff", {
      p_owner_email: currentUser.email,
      p_owner_password: pw,
      p_user_id: user.id,
    });
    if (error && isRpcMissing(error)) {
      ({ error } = await supabase.from("users").delete().eq("id", user.id));
    }
    if (error) {
      if (error.message?.includes("unauthorized")) setOwnerPw("");
      setStaffError(error.message?.includes("unauthorized")
        ? t("비밀번호가 틀렸습니다.", "Falsches Passwort.")
        : t("오류가 발생했습니다.", "Ein Fehler ist aufgetreten."));
      return;
    }
    setStaffUsers(prev => prev.filter(u => u.id !== user.id));
  }

  async function handlePostAnnounce() {
    if (!currentUser || !newAnnounceText.trim()) return;
    const content = newAnnounceText.trim();
    setNewAnnounceText("");
    const { data, error } = await supabase.from("announcements")
      .insert({ content, author_name: currentUser.name }).select().single();
    if (error || !data) {
      setNewAnnounceText(content); // 실패 시 입력 복원
      alert(t("공지 등록에 실패했습니다. 다시 시도해주세요.", "Ankündigung fehlgeschlagen. Bitte erneut versuchen."));
      return;
    }
    setAnnouncements(prev => [data, ...prev]);
    // 꺼져 있는 기기에도 푸시 발송 (실패해도 공지 등록 자체에는 영향 없음)
    fetch(SUPABASE_URL + "/functions/v1/send-push", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + SUPABASE_ANON_KEY, "apikey": SUPABASE_ANON_KEY },
      body: JSON.stringify({ title: "📢 " + currentUser.name, body: content, exclude_email: currentUser.email }),
    }).catch(() => {});
  }
  async function handleDeleteAnnounce(id) {
    const backup = announcements;
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    const { error } = await supabase.from("announcements").delete().eq("id", id);
    if (error) {
      setAnnouncements(backup); // 실패 시 롤백
      alert(t("삭제에 실패했습니다.", "Löschen fehlgeschlagen."));
    }
  }
  async function handlePostNote() {
    if (!currentUser || !newNoteText.trim()) return;
    const content = newNoteText.trim();
    const today = localDateStr(new Date());
    setNewNoteText("");
    const { data, error } = await supabase.from("daily_notes")
      .insert({ content, work_date: today, author_name: currentUser.name }).select().single();
    if (error || !data) {
      setNewNoteText(content); // 실패 시 입력 복원
      alert(t("특이사항 등록에 실패했습니다. 다시 시도해주세요.", "Notiz fehlgeschlagen. Bitte erneut versuchen."));
      return;
    }
    setDailyNotes(prev => [data, ...prev]);
  }
  async function handleDeleteNote(id) {
    const backup = dailyNotes;
    setDailyNotes(prev => prev.filter(n => n.id !== id));
    const { error } = await supabase.from("daily_notes").delete().eq("id", id);
    if (error) {
      setDailyNotes(backup); // 실패 시 롤백
      alert(t("삭제에 실패했습니다.", "Löschen fehlgeschlagen."));
    }
  }
  // 이 기기를 푸시 구독 등록 — 앱이 꺼져 있어도 공지 알림을 받음
  async function subscribePush() {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
      if (Notification.permission !== "granted") return;
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const json = sub.toJSON();
      const row = {
        endpoint: sub.endpoint,
        p256dh: json.keys.p256dh,
        auth: json.keys.auth,
        user_email: currentUserRef.current?.email || null,
        user_name: currentUserRef.current?.name || null,
      };
      // upsert(ON CONFLICT)는 충돌 검사에 조회 권한을 요구해 RLS에 막힘 → 삽입 후 중복이면 갱신
      let { error } = await supabase.from("push_subscriptions").insert(row);
      if (error && error.code === "23505") { // 이미 등록된 endpoint → 갱신
        const { endpoint, ...rest } = row;
        ({ error } = await supabase.from("push_subscriptions").update(rest).eq("endpoint", endpoint));
      }
      if (error) { console.warn("push save failed:", error); return; }
      setPushOn(true);
    } catch (e) {
      console.warn("push subscribe failed:", e);
    }
  }

  function notifyAnnounce(a) {
    setAnnounceAlert(a);
    if ("Notification" in window && Notification.permission === "granted" && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then(reg => reg.showNotification("📢 " + a.author_name, {
          body: a.content,
          tag: "yori2-announce",
          icon: "/yori2-order-app/icon-192.png",
          badge: "/yori2-order-app/icon-192.png",
        }))
        .catch(() => {});
    }
  }
  function markAnnounceRead() {
    const now = new Date().toISOString();
    setLastReadAnnounce(now);
    localStorage.setItem("yori2_read_announce", now);
    setAnnounceAlert(null);
  }
  function markNotesRead() {
    const now = new Date().toISOString();
    setLastReadNotes(now);
    localStorage.setItem("yori2_read_notes", now);
  }

  async function handleLogin() {
    setLoginLoading(true);
    setLoginError("");
    const { data, error } = await supabase
      .from("users_public")
      .select("email, name, role")
      .eq("email", loginEmail.trim().toLowerCase())
      .single();
    setLoginLoading(false);
    if (error || !data) {
      setLoginError(t("등록되지 않은 이메일입니다.", "Unbekannte E-Mail-Adresse."));
      return;
    }
    if (data.role === "owner") {
      setPendingUser(data);
      setPwPopup(true);
      setPwInput("");
      setPwError("");
    } else {
      const userToStore = { email: data.email, name: data.name, role: data.role };
      setCurrentUser(userToStore);
      localStorage.setItem("yori2_user", JSON.stringify(userToStore));
      setPage("home");
      loadManualPage(MANUAL_ROOT_ID, "메뉴얼", null);
      loadSchedule(new Date().getMonth());
    }
  }

  async function handlePasswordSubmit() {
    const { data, error } = await supabase.rpc("verify_login", {
      p_email: pendingUser.email,
      p_password: pwInput,
    });
    if (error || !data || data.length === 0) {
      setPwError(t("비밀번호가 틀렸습니다.", "Falsches Passwort."));
      return;
    }
    const u = data[0];
    const userToStore = { email: u.email, name: u.name, role: u.role };
    setCurrentUser(userToStore);
    localStorage.setItem("yori2_user", JSON.stringify(userToStore));
    setPage("home");
    loadManualPage(MANUAL_ROOT_ID, "메뉴얼", null);
    loadSchedule(new Date().getMonth());
    setOwnerPw(pwInput);
    setPwPopup(false); setPendingUser(null); setPwInput(""); setPwError("");
  }

  function handleLogout() {
    setCurrentUser(null); setLoginEmail(""); setSelectedSupplier(null);
    setQuantities({}); setNote(""); setSubmitted(false); setOwnerPw("");
    localStorage.removeItem("yori2_user");
    localStorage.removeItem("yori2_page");
  }

  function handleQty(itemId, val) {
    setQuantities(q => ({ ...q, [itemId]: Math.max(0, Number(val) || 0) }));
  }

  function handleSubmitOrder() {
    if (!currentUser || !selectedSupplier) return;
    const todayStr = localDateStr(new Date());
    const dup = orders.find(o => o.supplier === selectedSupplier.id && localDateStr(new Date(o.date)) === todayStr);
    if (dup && !window.confirm(t(
      `⚠️ 오늘 이미 ${dup.staffName}님이 이 업체에 발주했습니다.\n그래도 전송하시겠습니까?`,
      `⚠️ ${dup.staffName} hat heute bereits bei diesem Lieferanten bestellt.\nTrotzdem senden?`
    ))) return;
    const msg = buildOrderMessage(selectedSupplier, quantities, lang, currentUser.name, note);
    if (!msg) return;
    const order = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      staffName: currentUser.name,
      staffEmail: currentUser.email,
      supplier: selectedSupplier.id,
      supplierName: selectedSupplier.name,
      channel: selectedSupplier.channel,
      quantities: { ...quantities },
      note,
      message: msg,
      status: "pending",
    };
    setOrders(prev => [order, ...prev]);
    supabase.from("orders").insert({
      id: order.id,
      date: order.date,
      staff_name: order.staffName,
      staff_email: order.staffEmail,
      supplier: order.supplier,
      supplier_name: order.supplierName,
      channel: order.channel,
      quantities: order.quantities,
      note: order.note,
      message: order.message,
      status: order.status,
    }).then(({ error }) => {
      if (error) {
        console.error("Supabase insert error:", error);
        alert(t("발주 메시지는 전송되었으나 내역 저장에 실패했습니다. 네트워크를 확인해주세요.",
                "Bestellung gesendet, aber Speichern fehlgeschlagen. Bitte Netzwerk prüfen."));
      }
    });
    setSubmitted(true);
    const encodedMsg = encodeURIComponent(`[Yori2 발주 요청]\n${msg}`);
    window.open(`https://wa.me/${OWNER_WHATSAPP.replace(/[^0-9]/g,"")}?text=${encodedMsg}`, "_blank");
  }

  function handleNewOrder() {
    setSelectedSupplier(null); setQuantities({}); setNote(""); setSubmitted(false); setItemSearch("");
  }

  function handleCopyMessage(msg, id) {
    navigator.clipboard.writeText(msg);
    setCopiedMsg(id);
    setTimeout(() => setCopiedMsg(null), 2000);
  }

  function handleMarkDone(orderId) {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: "sent" } : o));
    supabase.from("orders").update({ status: "sent" }).eq("id", orderId)
      .then(({ error }) => { if (error) console.error("Order update error:", error); });
  }

  function handleDeleteOrder(orderId) {
    if (!window.confirm(t("이 발주 내역을 삭제하시겠습니까?", "Diesen Eintrag wirklich löschen?"))) return;
    setOrders(prev => prev.filter(o => o.id !== orderId));
    supabase.from("orders").delete().eq("id", orderId)
      .then(({ error }) => { if (error) console.error("Supabase delete error:", error); });
  }

  const totalItems = selectedSupplier
    ? selectedSupplier.items.filter(i => quantities[i.id] > 0).length
    : 0;
  const unreadAnnounce = announcements.filter(a =>
    a.author_name !== currentUser?.name && (!lastReadAnnounce || a.created_at > lastReadAnnounce)
  ).length;
  const unreadNotes = dailyNotes.filter(n =>
    n.author_name !== currentUser?.name && (!lastReadNotes || n.created_at > lastReadNotes)
  ).length;
  // 앱 아이콘 숫자 배지 — 안 읽은 공지 수 (설치된 PWA에서 동작, 확인 시 자동 제거)
  useEffect(() => {
    if (!("setAppBadge" in navigator)) return;
    if (unreadAnnounce > 0) navigator.setAppBadge(unreadAnnounce).catch(() => {});
    else navigator.clearAppBadge().catch(() => {});
  }, [unreadAnnounce]);
  // 로그인 + 알림 권한 허용 상태면 이 기기를 푸시 구독 등록/갱신
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (currentUser && notifPerm === "granted") subscribePush();
  }, [currentUser, notifPerm]);
  // 로그인하면 알림 권한을 자동으로 요청 (아직 결정 전인 경우) — 직원이 카드를 찾을 필요 없이 바로 허용창이 뜸
  useEffect(() => {
    if (currentUser && notifPerm === "default" && "Notification" in window) {
      Notification.requestPermission().then(p => setNotifPerm(p)).catch(() => {});
    }
  }, [currentUser]); // eslint-disable-line react-hooks/exhaustive-deps
  const todayInfo = (() => {
    if (!scheduleData) return null;
    const today = new Date();
    for (const week of scheduleData.weeks) {
      const di = week.dates.findIndex(d => d.day === today.getDate() && d.month === today.getMonth() + 1);
      if (di >= 0) {
        return {
          memo: week.dates[di].memo || "",
          shifts: scheduleData.staffNames
            .map(name => ({ name, shift: (week.staff[name]?.[di] || "").trim() }))
            .filter(s => s.shift),
        };
      }
    }
    return null;
  })();

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  // Password popup for owner login
  if (pwPopup) return (
    <div style={styles.loginWrap}>
      <div style={styles.loginCard}>
        <img src={logoUrl} alt="Yori2" style={styles.logo} />
        <div style={styles.loginTitle}>🔐 {t("사장님 비밀번호","Passwort Inhaber")}</div>
        <div style={{fontSize:12,color:"#888",marginBottom:14}}>{pendingUser?.name}</div>
        <input
          style={styles.input}
          type="password"
          placeholder={t("비밀번호 입력","Passwort eingeben")}
          value={pwInput}
          onChange={e=>setPwInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&handlePasswordSubmit()}
          autoFocus
        />
        {pwError && <div style={styles.error}>{pwError}</div>}
        <button style={styles.primaryBtn} onClick={handlePasswordSubmit}>
          {t("확인","Bestätigen")}
        </button>
        <button style={styles.ghostBtn} onClick={()=>{setPwPopup(false);setPendingUser(null);setPwInput("");setPwError("");}}>
          {t("취소","Abbrechen")}
        </button>
      </div>
    </div>
  );

    const updateBanner = swWaiting ? (
      <div style={{position:"fixed",left:0,right:0,bottom:0,zIndex:9999,background:"#1a1a2e",borderTop:"1px solid #863bff",padding:"12px 16px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 -4px 20px rgba(0,0,0,0.5)"}}>
        <div style={{fontSize:22}}>🆕</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontWeight:700,fontSize:13,color:"#e8e8f0"}}>{t("새 버전이 있습니다","Neue Version verfügbar")}</div>
        </div>
        <button
          style={{...styles.primaryBtn,width:"auto",padding:"8px 14px",fontSize:13,margin:0,whiteSpace:"nowrap"}}
          onClick={() => { swWaiting.postMessage({type:"SKIP_WAITING"}); }}>
          {t("업데이트","Update")}
        </button>
        <button style={{background:"none",border:"none",color:"#888",fontSize:20,cursor:"pointer",padding:"0 4px"}} onClick={() => setSwWaiting(null)}>×</button>
      </div>
    ) : null;

    if (!currentUser) return (
    <div style={styles.loginWrap}>
      <div style={styles.loginCard}>
        <img src={logoUrl} alt="Yori2" style={styles.logo} />
        <div style={styles.loginTitle}>{t("발주 관리","Bestellverwaltung")}</div>
        <div style={styles.langRow}>
          <button style={lang==="ko"?styles.langActive:styles.langBtn} onClick={()=>setLang("ko")}>한국어</button>
          <button style={lang==="de"?styles.langActive:styles.langBtn} onClick={()=>setLang("de")}>Deutsch</button>
        </div>
        <input
          style={styles.input}
          type="email"
          placeholder={t("이메일 주소 입력", "E-Mail-Adresse eingeben")}
          value={loginEmail}
          onChange={e => setLoginEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !loginLoading && handleLogin()}
          disabled={loginLoading}
        />
        {loginError && <div style={styles.error}>{loginError}</div>}
        <button style={styles.primaryBtn} onClick={handleLogin} disabled={loginLoading}>
          {loginLoading ? t("확인 중...", "Prüfen...") : t("로그인", "Anmelden")}
        </button>
      </div>
      {updateBanner}
    </div>
  );

  // ── MAIN ──────────────────────────────────────────────────────────────────
  const watermark = (currentUser && currentUser.role !== "owner") ? (() => {
    const now = new Date();
    const stamp = `${currentUser.name}  ${now.toLocaleDateString("de-DE")} ${now.toLocaleTimeString("de-DE", {hour:"2-digit",minute:"2-digit"})}`;
    const items = Array.from({length: 30}, (_, i) => (
      <div key={i} style={{whiteSpace:"nowrap", padding:"6px 20px", fontSize:13, opacity:0.06, color:"#fff", transform:`rotate(-30deg)`, userSelect:"none"}}>
        {stamp}
      </div>
    ));
    return (
      <div style={{position:"fixed",inset:0,zIndex:8888,pointerEvents:"none",overflow:"hidden",display:"flex",flexWrap:"wrap",alignContent:"flex-start",gap:0,userSelect:"none",WebkitUserSelect:"none"}}>
        {items}
      </div>
    );
  })() : null;

  // 직원 계정: 텍스트 선택 방지 (단, 입력창은 정상 편집 가능하도록 예외)
  const noSelectStyle = (currentUser && currentUser.role !== "owner")
    ? `* { -webkit-user-select: none !important; user-select: none !important; }
       input, textarea { -webkit-user-select: text !important; user-select: text !important; }`
    : "";

  return (
    <div style={styles.app}>
      {noSelectStyle && <style>{noSelectStyle}</style>}
      {watermark}
      {updateBanner}
      {announceAlert && (
        <div style={{position:"fixed",top:10,left:10,right:10,zIndex:9998,background:"#1e1e2e",border:"1px solid #7b8cde",borderRadius:14,padding:"12px 14px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 4px 20px rgba(0,0,0,0.5)"}}>
          <div style={{fontSize:24}}>📢</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:700,fontSize:13,color:"#e8e8f0"}}>{t("새 공지사항","Neue Ankündigung")} · {announceAlert.author_name}</div>
            <div style={{fontSize:12,color:"#aaa",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{announceAlert.content}</div>
          </div>
          <button
            style={{...styles.primaryBtn,width:"auto",padding:"8px 14px",fontSize:13,margin:0,whiteSpace:"nowrap"}}
            onClick={() => { setPage("announce"); markAnnounceRead(); }}>
            {t("확인","Ansehen")}
          </button>
        </div>
      )}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src={logoUrl} alt="Yori2" style={styles.headerLogo} />
          <div>
            <div style={styles.headerTitle}>Yori2</div>
            <div style={styles.headerUser}>{currentUser.name}</div>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.langRow}>
            <button style={lang==="ko"?styles.langActive:styles.langBtn} onClick={()=>setLang("ko")}>KO</button>
            <button style={lang==="de"?styles.langActive:styles.langBtn} onClick={()=>setLang("de")}>DE</button>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>{t("로그아웃","Abmelden")}</button>
        </div>
      </header>

      <nav style={styles.nav} className="yori-nav">
        <button style={page==="home"?styles.navActive:styles.navBtn} onClick={()=>setPage("home")}>
          🏠 {t("홈","Home")}
        </button>
        <button style={page==="announce"?styles.navActive:styles.navBtn} onClick={()=>{setPage("announce");markAnnounceRead();}}>
          📢 {t("공지","Info")}
          {unreadAnnounce > 0 && <span style={styles.badge}>{unreadAnnounce}</span>}
        </button>
        <button style={page==="notes"?styles.navActive:styles.navBtn} onClick={()=>{setPage("notes");markNotesRead();}}>
          📝 {t("특이사항","Notizen")}
          {unreadNotes > 0 && <span style={styles.badge}>{unreadNotes}</span>}
        </button>
        <button style={page==="manual"?styles.navActive:styles.navBtn} onClick={()=>{setPage("manual"); if(manualBlocks.length===0) loadManualPage(MANUAL_ROOT_ID,"메뉴얼",null);}}>
          📖 {t("메뉴얼","Handbuch")}
        </button>
        <button style={page==="schedule"?styles.navActive:styles.navBtn} onClick={()=>{setPage("schedule"); loadSchedule(scheduleSelectedMonth);}}>
          📅 {t("근무일정","Dienstplan")}
        </button>
        <button style={page==="order"?styles.navActive:styles.navBtn} onClick={()=>{setPage("order");handleNewOrder();}}>
          📦 {t("발주","Bestellung")}
        </button>
        <button style={page==="history"?styles.navActive:styles.navBtn} onClick={()=>setPage("history")}>
          📋 {t("내역","Verlauf")}
          {orders.filter(o=>o.status==="pending").length > 0 &&
            <span style={styles.badge}>{orders.filter(o=>o.status==="pending").length}</span>}
        </button>
        {currentUser.role==="owner" && (
          <button style={page==="settings"?styles.navActive:styles.navBtn} onClick={()=>{setPage("settings");setSettingsView("list");}}>
            ⚙️ {t("설정","Einst.")}
          </button>
        )}
      </nav>

      <main style={styles.main}>

        {page === "home" && (
          <div>
            <div style={{fontSize:16,fontWeight:700,color:"#e8e8f0",marginBottom:6}}>
              {t(`안녕하세요, ${currentUser.name}님 👋`, `Hallo, ${currentUser.name} 👋`)}
            </div>
            <div style={{fontSize:12,color:"#888",marginBottom:20}}>
              {new Date().toLocaleDateString(lang==="ko"?"ko-KR":"de-DE",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
            </div>

            {/* 알림 켜짐 표시 */}
            {pushOn && (
              <div style={{fontSize:11,color:"#7fd88a",marginBottom:12}}>
                🔔 {t("알림 켜짐","Benachrichtigungen aktiv")}
              </div>
            )}

            {/* 알림 권한 요청 */}
            {notifPerm === "default" && (
              <div style={{background:"#1a1a2e",border:"1px solid #7b8cde44",borderRadius:14,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
                <div style={{fontSize:28}}>🔔</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#e8e8f0"}}>{t("알림 켜기","Benachrichtigungen aktivieren")}</div>
                  <div style={{fontSize:11,color:"#888",marginTop:2}}>{t("새 공지가 올라오면 알림을 받아요","Bei neuen Ankündigungen benachrichtigt werden")}</div>
                </div>
                <button
                  onClick={() => Notification.requestPermission().then(p => setNotifPerm(p))}
                  style={{background:"#863bff",color:"#fff",border:"none",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                  {t("켜기","Aktivieren")}
                </button>
              </div>
            )}

            {/* 앱 설치 버튼 */}
            {(installPrompt || (/iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone)) && (
              <div style={{background:"#1a1a2e",border:"1px solid #863bff44",borderRadius:14,padding:"14px 18px",marginBottom:16,display:"flex",alignItems:"center",gap:14}}>
                <div style={{fontSize:28}}>📲</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#e8e8f0"}}>{t("앱으로 설치","App installieren")}</div>
                  <div style={{fontSize:11,color:"#888",marginTop:2}}>{t("홈 화면에 추가하면 더 빠르게 실행돼요","Zum Startbildschirm hinzufügen")}</div>
                </div>
                <button
                  onClick={async () => {
                    if (installPrompt) {
                      await installPrompt.prompt();
                      const { outcome } = await installPrompt.userChoice;
                      if (outcome === "accepted") setInstallPrompt(null);
                    } else {
                      setShowIosInstall(true);
                    }
                  }}
                  style={{background:"#863bff",color:"#fff",border:"none",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                  {t("설치","Installieren")}
                </button>
              </div>
            )}

            {/* iOS 설치 안내 모달 */}
            {showIosInstall && (
              <div style={{position:"fixed",inset:0,background:"#000a",zIndex:999,display:"flex",alignItems:"flex-end"}} onClick={()=>setShowIosInstall(false)}>
                <div style={{background:"#1e1e2e",borderRadius:"20px 20px 0 0",padding:28,width:"100%",boxSizing:"border-box"}} onClick={e=>e.stopPropagation()}>
                  <div style={{fontWeight:700,fontSize:16,color:"#e8e8f0",marginBottom:16,textAlign:"center"}}>📲 {t("홈 화면에 추가","Zum Startbildschirm")}</div>
                  <div style={{display:"flex",flexDirection:"column",gap:12}}>
                    {[
                      {step:"1", text: t("하단 공유 버튼 탭 (□↑)","Unten auf Teilen tippen (□↑)")},
                      {step:"2", text: t("'홈 화면에 추가' 선택","'Zum Home-Bildschirm' wählen")},
                      {step:"3", text: t("'추가' 버튼 탭","'Hinzufügen' tippen")},
                    ].map(({step, text}) => (
                      <div key={step} style={{display:"flex",alignItems:"center",gap:14}}>
                        <div style={{width:28,height:28,borderRadius:"50%",background:"#863bff",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,flexShrink:0}}>{step}</div>
                        <div style={{fontSize:14,color:"#ccc"}}>{text}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={()=>setShowIosInstall(false)} style={{marginTop:24,width:"100%",background:"#2a2a3e",color:"#aaa",border:"none",borderRadius:10,padding:"12px",fontSize:14,cursor:"pointer"}}>
                    {t("닫기","Schließen")}
                  </button>
                </div>
              </div>
            )}
            {todayInfo && (todayInfo.shifts.length > 0 || todayInfo.memo) && (
              <div
                onClick={()=>{ setPage("schedule"); loadSchedule(scheduleSelectedMonth); }}
                style={{background:"#1e1e2e",border:"1px solid #2a2a3e",borderRadius:14,padding:"14px 16px",marginBottom:12,cursor:"pointer"}}>
                <div style={{fontWeight:700,fontSize:13,color:"#c8c8d8",marginBottom:10}}>👥 {t("오늘 근무","Heute im Dienst")}</div>
                {todayInfo.memo && (
                  <div style={{fontSize:12,color:"#f5d020",marginBottom:8}}>📌 {todayInfo.memo}</div>
                )}
                <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                  {todayInfo.shifts.map(({name, shift}) => {
                    const isVacation = /^U\d*/i.test(shift);
                    const c = isVacation ? "#f5d020" : shift==="O" ? "#7ab8f5" : shift==="N" ? "#c89eff" : shift==="F" ? "#7fd88a" : "#a0d0c0";
                    return (
                      <span key={name} style={{background:"#13131f",border:`1px solid ${c}55`,borderRadius:16,padding:"4px 10px",fontSize:12,color:"#e8e8f0"}}>
                        {name} <b style={{color:c}}>{shift}</b>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {[
              { icon:"📢", label:t("공지사항","Ankündigungen"), sub:t("오너 공지 확인","Ankündigungen lesen"), badge: unreadAnnounce, action:()=>{ setPage("announce"); markAnnounceRead(); } },
              { icon:"📝", label:t("특이사항","Tagesnotizen"), sub:t("오늘의 특이사항 기록","Notizen des Tages"), badge: unreadNotes, action:()=>{ setPage("notes"); markNotesRead(); } },
              { icon:"📖", label:t("식당 메뉴얼","Handbuch"), sub:t("레시피 및 운영 메뉴얼","Rezepte & Handbuch"), action:()=>{ setPage("manual"); if(manualBlocks.length===0) loadManualPage(MANUAL_ROOT_ID,"메뉴얼",null); } },
              { icon:"📅", label:t("근무일정","Dienstplan"), sub:t("이번 주 근무표 확인","Dienstplan ansehen"), action:()=>{ setPage("schedule"); loadSchedule(scheduleSelectedMonth); } },
              { icon:"📦", label:t("식자재 발주","Bestellung"), sub:t("공급업체에 발주서 작성","Bestellung aufgeben"), action:()=>{ setPage("order"); handleNewOrder(); } },
            ].map(item => (
              <div
                key={item.label}
                onClick={item.action || undefined}
                style={{
                  background: item.action ? "#1e1e2e" : "#161622",
                  border: "1px solid " + (item.badge > 0 ? "#7b8cde" : "#2a2a3e"),
                  borderRadius: 14,
                  padding: "18px 20px",
                  marginBottom: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  cursor: item.action ? "pointer" : "default",
                  opacity: item.action ? 1 : 0.45,
                }}
              >
                <div style={{fontSize:32}}>{item.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:15,color:"#e8e8f0",display:"flex",alignItems:"center",gap:6}}>
                    {item.label}
                    {item.badge > 0 && <span style={styles.badge}>{item.badge}</span>}
                  </div>
                  <div style={{fontSize:12,color:"#888",marginTop:2}}>{item.sub}</div>
                </div>
                {item.action && <div style={{color:"#555",fontSize:18}}>›</div>}
              </div>
            ))}
          </div>
        )}

        {page === "announce" && (
          <div>
            <div style={{fontWeight:700,fontSize:15,color:"#e8e8f0",marginBottom:16}}>📢 {t("공지사항","Ankündigungen")}</div>
            {currentUser.role === "owner" && (
              <div style={{marginBottom:16}}>
                <textarea
                  style={{...styles.input, minHeight:80, resize:"vertical", fontFamily:"inherit"}}
                  placeholder={t("공지사항을 입력하세요","Ankündigung eingeben")}
                  value={newAnnounceText}
                  onChange={e=>setNewAnnounceText(e.target.value)}
                />
                <button style={newAnnounceText.trim() ? styles.primaryBtn : styles.disabledBtn} onClick={handlePostAnnounce} disabled={!newAnnounceText.trim()}>
                  {t("공지 등록","Veröffentlichen")}
                </button>
              </div>
            )}
            {announcements.length === 0 && (
              <div style={{color:"#555",textAlign:"center",padding:40,fontSize:13}}>{t("등록된 공지사항이 없습니다.","Keine Ankündigungen.")}</div>
            )}
            {announcements.map(a => (
              <div key={a.id} style={{background:"#1e1e2e",border:"1px solid #2a2a3e",borderRadius:12,padding:"14px 16px",marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <div style={{fontSize:11,color:"#888"}}>{a.author_name} · {new Date(a.created_at).toLocaleDateString(lang==="ko"?"ko-KR":"de-DE",{month:"short",day:"numeric"})} {new Date(a.created_at).toLocaleTimeString(lang==="ko"?"ko-KR":"de-DE",{hour:"2-digit",minute:"2-digit"})}</div>
                  {currentUser.role === "owner" && (
                    <button onClick={()=>handleDeleteAnnounce(a.id)} style={{background:"transparent",border:"none",color:"#555",cursor:"pointer",fontSize:16,padding:0,lineHeight:1}}>✕</button>
                  )}
                </div>
                <div style={{fontSize:13,color:"#c8c8d8",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{a.content}</div>
              </div>
            ))}
          </div>
        )}

        {page === "notes" && (
          <div>
            <div style={{fontWeight:700,fontSize:15,color:"#e8e8f0",marginBottom:16}}>📝 {t("특이사항","Tagesnotizen")}</div>
            <div style={{marginBottom:16}}>
              <textarea
                style={{...styles.input, minHeight:80, resize:"vertical", fontFamily:"inherit"}}
                placeholder={t("오늘의 특이사항을 입력하세요","Notiz für heute eingeben")}
                value={newNoteText}
                onChange={e=>setNewNoteText(e.target.value)}
              />
              <button style={newNoteText.trim() ? styles.primaryBtn : styles.disabledBtn} onClick={handlePostNote} disabled={!newNoteText.trim()}>
                {t("등록","Eintragen")}
              </button>
            </div>
            {dailyNotes.length === 0 && (
              <div style={{color:"#555",textAlign:"center",padding:40,fontSize:13}}>{t("등록된 특이사항이 없습니다.","Keine Notizen vorhanden.")}</div>
            )}
            {Object.entries(
              dailyNotes.reduce((acc, n) => { if (!acc[n.work_date]) acc[n.work_date] = []; acc[n.work_date].push(n); return acc; }, {})
            ).sort(([a],[b]) => b.localeCompare(a)).map(([date, notes]) => {
              const today = localDateStr(new Date());
              const yesterday = localDateStr(new Date(Date.now()-86400000));
              const label = date === today ? t("오늘","Heute") : date === yesterday ? t("어제","Gestern") : date;
              return (
                <div key={date} style={{marginBottom:18}}>
                  <div style={{fontSize:12,color:"#7b8cde",fontWeight:700,marginBottom:8}}>{label}</div>
                  {notes.map(n => (
                    <div key={n.id} style={{background:"#1e1e2e",border:"1px solid #2a2a3e",borderRadius:12,padding:"14px 16px",marginBottom:8}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div style={{fontSize:11,color:"#888"}}>{n.author_name} · {new Date(n.created_at).toLocaleTimeString(lang==="ko"?"ko-KR":"de-DE",{hour:"2-digit",minute:"2-digit"})}</div>
                        {(currentUser.role === "owner" || currentUser.name === n.author_name) && (
                          <button onClick={()=>handleDeleteNote(n.id)} style={{background:"transparent",border:"none",color:"#555",cursor:"pointer",fontSize:16,padding:0,lineHeight:1}}>✕</button>
                        )}
                      </div>
                      <div style={{fontSize:13,color:"#c8c8d8",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{n.content}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {page === "manual" && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16}}>
              {manualStack.length > 0 && (
                <button style={styles.backBtn} onClick={manualGoBack}>←</button>
              )}
              <div style={{fontWeight:700,fontSize:15,color:"#e8e8f0"}}>📖 {manualTitle}</div>
            </div>
            {manualLoading && <div style={{color:"#888",textAlign:"center",padding:30}}>{t("불러오는 중...","Laden...")}</div>}
            {manualError && <div style={styles.error}>{manualError}</div>}
            {!manualLoading && manualViewType === "database" && (() => {
              const pages = manualBlocks.map(page => {
                const titleProp = Object.values(page.properties || {}).find(p => p.type === "title");
                const title = titleProp?.title?.map(t => t.plain_text).join("") || "Untitled";
                const icon = page.icon?.emoji || "📄";
                const props = page.properties || {};
                const catProp = Object.entries(props).find(([k, v]) => k.toLowerCase() === "kategorie" && (v.type === "select" || v.type === "multi_select"))?.[1]
                  || Object.values(props).find(p => p.type === "select" || p.type === "multi_select");
                const categories = catProp
                  ? catProp.type === "select"
                    ? catProp.select ? [catProp.select.name] : []
                    : (catProp.multi_select || []).map(c => c.name)
                  : [];
                return { page, title, icon, categories };
              });

              const allCategories = [...new Set(pages.flatMap(p => p.categories))].filter(Boolean).sort();

              const filtered = pages.filter(({ title, categories }) => {
                const matchSearch = title.toLowerCase().includes(dbSearch.toLowerCase());
                const matchCat = !dbCategory || categories.includes(dbCategory);
                return matchSearch && matchCat;
              });

              // 필터 미선택 시 카테고리 순서대로 정렬 (각 레시피는 가장 앞선 카테고리 기준)
              if (!dbCategory) {
                const rank = ({ categories }) => {
                  const idxs = categories.map(c => RECIPE_CATEGORY_ORDER.indexOf(c)).filter(i => i >= 0);
                  return idxs.length ? Math.min(...idxs) : RECIPE_CATEGORY_ORDER.length;
                };
                filtered.sort((a, b) => rank(a) - rank(b));
              }

              return (
                <div>
                  {/* 검색창 */}
                  <div style={{position:"relative", marginBottom:10}}>
                    <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#555",fontSize:14}}>🔍</span>
                    <input
                      value={dbSearch}
                      onChange={e => setDbSearch(e.target.value)}
                      placeholder={t("레시피 검색...","Rezept suchen...")}
                      style={{width:"100%",boxSizing:"border-box",background:"#1a1a2e",border:"1px solid #333",borderRadius:8,color:"#e8e8f0",padding:"8px 10px 8px 32px",fontSize:13,outline:"none"}}
                    />
                  </div>

                  {/* 카테고리 칩 */}
                  {allCategories.length > 0 && (
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                      <button
                        onClick={() => setDbCategory("")}
                        style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,border:"none",cursor:"pointer",
                          background: !dbCategory ? "#f5a623" : "#2a2a3e",
                          color: !dbCategory ? "#000" : "#aaa"}}>
                        {t("전체","Alle")}
                      </button>
                      {allCategories.map(cat => (
                        <button key={cat}
                          onClick={() => setDbCategory(dbCategory === cat ? "" : cat)}
                          style={{padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:600,border:"none",cursor:"pointer",
                            background: dbCategory === cat ? "#f5a623" : "#2a2a3e",
                            color: dbCategory === cat ? "#000" : "#aaa"}}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 결과 목록 */}
                  {filtered.length === 0 && (
                    <div style={{color:"#555",textAlign:"center",padding:20,fontSize:13}}>{t("검색 결과 없음","Keine Ergebnisse")}</div>
                  )}
                  {filtered.map(({ page, title, icon, categories }) => (
                    <div key={page.id}
                      onClick={() => loadManualPage(page.id, title, {id: currentManualId, title: manualTitle, viewType: "database"})}
                      style={{...styles.historyCard, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8, cursor:"pointer"}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:13,color:"#e8e8f0"}}>{icon} {title}</div>
                        {categories.length > 0 && (
                          <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
                            {categories.map(c => (
                              <span key={c} style={{fontSize:10,background:"#2a2a3e",color:"#888",borderRadius:4,padding:"1px 6px"}}>{c}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div style={{color:"#555",fontSize:18}}>›</div>
                    </div>
                  ))}
                </div>
              );
            })()}
            {!manualLoading && manualViewType === "blocks" && manualBlocks.map(block => renderNotionBlock(block))}
          </div>
        )}

        {page === "schedule" && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div style={{fontWeight:700,fontSize:15,color:"#e8e8f0"}}>📅 {t("근무일정","Dienstplan")}</div>
              <select
                style={{background:"#1e1e2e",color:"#e8e8f0",border:"1px solid #333",borderRadius:8,padding:"4px 8px",fontSize:13}}
                value={scheduleSelectedMonth}
                onChange={e=>loadSchedule(Number(e.target.value))}
              >
                {MONTH_DE.map((m,i)=>(
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
            </div>

            {scheduleLoading && <div style={{color:"#888",textAlign:"center",padding:30}}>{t("불러오는 중...","Laden...")}</div>}
            {scheduleError && <div style={styles.error}>{scheduleError}</div>}

            {scheduleData && !scheduleLoading && (() => {
              const week = scheduleData.weeks[scheduleWeekIndex];
              if (!week) return null;
              const today = new Date();
              const isViewingCurrentMonth = scheduleSelectedMonth === today.getMonth();
              const SHIFT_COLOR = { O:"#1a3a5c", N:"#2a1a4a", F:"#2a2a2a", "":"#111" };
              const SHIFT_LABEL = { O:"O", N:"N", F:"F" };
              return (
                <div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                    <button style={styles.backBtn} onClick={()=>setScheduleWeekIndex(i=>Math.max(0,i-1))} disabled={scheduleWeekIndex===0}>‹ {t("이전","Vor.")}</button>
                    <div style={{fontSize:12,color:"#aaa",textAlign:"center"}}>
                      {`${week.dates[0].day}. – ${week.dates[6].day}.`}
                    </div>
                    <button style={styles.backBtn} onClick={()=>setScheduleWeekIndex(i=>Math.min(scheduleData.weeks.length-1,i+1))} disabled={scheduleWeekIndex===scheduleData.weeks.length-1}>{t("다음","Nächs.")} ›</button>
                  </div>

                  {/* 특별 일정 메모 (날짜 헤더 위에 적힌 내용) */}
                  {week.dates.some(d => d.memo) && (
                    <div style={{background:"#1e1c10",border:"1px solid #3a3416",borderRadius:8,padding:"7px 10px",marginBottom:8}}>
                      {week.dates.map((d, i) => d.memo ? (
                        <div key={i} style={{fontSize:11,color:"#f5d020",padding:"1px 0"}}>
                          📌 {["MO","DI","MI","DO","FR","SA","SO"][i]} {d.day}. — {d.memo}
                        </div>
                      ) : null)}
                    </div>
                  )}

                  {/* 날짜 헤더 */}
                  <div style={{display:"grid", gridTemplateColumns:`80px repeat(7, 1fr)`, gap:2, marginBottom:4}}>
                    <div/>
                    {["MO","DI","MI","DO","FR","SA","SO"].map((d,i) => {
                      const isToday = isViewingCurrentMonth && week.dates[i].day === today.getDate() && week.dates[i].month === today.getMonth()+1;
                      const isHoliday = week.dates[i].isHoliday;
                      return (
                        <div key={d} style={{textAlign:"center",fontSize:10,fontWeight:isToday?700:400,
                          background: isToday ? "#2a2000" : isHoliday ? "#2a0000" : "transparent",
                          borderRadius:5, padding:"3px 1px",
                          border: isToday ? "1px solid #f5a623" : "1px solid transparent"}}>
                          <div style={{color: isHoliday ? "#ff6b6b" : isToday ? "#f5a623" : "#888"}}>{d}</div>
                          <div style={{fontSize:12, fontWeight:700, color: isHoliday ? "#ff6b6b" : isToday ? "#f5a623" : "#ccc"}}>{week.dates[i].day}</div>
                          {isToday && <div style={{fontSize:9,color:"#f5a623"}}>오늘</div>}
                          {isHoliday && <div style={{fontSize:9,color:"#ff6b6b"}}>공휴일</div>}
                          {week.dates[i].memo && <div style={{fontSize:9}}>📌</div>}
                        </div>
                      );
                    })}
                  </div>

                  {/* 직원별 행 */}
                  {scheduleData.staffNames.map(name => {
                    const userTokens = currentUser.name.toLowerCase().split(/\s+/);
                    const isMe = userTokens.includes(name.toLowerCase()) || name.toLowerCase() === currentUser.name.toLowerCase();
                    return (
                    <div key={name} style={{display:"grid", gridTemplateColumns:`80px repeat(7, 1fr)`, gap:2, marginBottom:3}}>
                      <div style={{fontSize:11,fontWeight:isMe?700:600,color:isMe?"#f5a623":"#c8c8d8",display:"flex",alignItems:"center",paddingRight:4, overflow:"hidden", whiteSpace:"nowrap"}}>{isMe?"★ ":""}{name}</div>
                      {week.staff[name]?.map((shift, di) => {
                        const isToday = isViewingCurrentMonth && week.dates[di].day === today.getDate() && week.dates[di].month === today.getMonth()+1;
                        const isHoliday = week.dates[di].isHoliday;
                        const isVacation = /^U\d*/i.test(shift);
                        const bg = isHoliday ? "#2a0a0a"
                          : isVacation ? "#2a2200"
                          : shift === "O" ? "#1a3a5c"
                          : shift === "N" ? "#2d1a4a"
                          : shift === "F" ? "#1a2e1a"
                          : shift ? "#1a2a2a" : "#161622";
                        const color = isHoliday ? "#ff8080"
                          : isVacation ? "#f5d020"
                          : shift === "O" ? "#7ab8f5"
                          : shift === "N" ? "#c89eff"
                          : shift === "F" ? "#7fd88a"
                          : shift ? "#a0d0c0" : "#333";
                        return (
                          <div key={di} style={{
                            background: bg,
                            border: isToday ? "1px solid #f5a623" : isHoliday ? "1px solid #ff4444" : "1px solid #222",
                            borderRadius:5,
                            textAlign:"center",
                            padding:"5px 2px",
                            fontSize:11,
                            fontWeight:600,
                            color,
                          }}>{shift || ""}</div>
                        );
                      })}
                    </div>
                    );
                  })}

                  <div style={{marginTop:14,fontSize:11,color:"#555",display:"flex",gap:12,flexWrap:"wrap"}}>
                    {[["O","#7ab8f5",t("하루종일","Ganzen Tag")],["N","#c89eff",t("오후","Nacht")],["F","#7fd88a",t("오전","Früh")],["U","#f5d020",t("휴가","Urlaub")]].map(([k,c,l])=>(
                      <span key={k}><span style={{color:c,fontWeight:700}}>{k}</span> {l}</span>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {page === "order" && !submitted && (
          <>
            {!selectedSupplier ? (
              <div>
                <div style={styles.sectionTitle}>{t("공급업체 선택","Lieferant auswählen")}</div>
                <div style={styles.supplierGrid}>
                  {suppliers.map(s => (
                    <button key={s.id} style={{...styles.supplierCard, borderColor: s.color}}
                      onClick={() => { setSelectedSupplier(s); setQuantities({}); }}>
                      <div style={styles.supplierIcon}>{s.icon}</div>
                      <div style={styles.supplierName}>{s.name[lang]}</div>
                      <div style={{...styles.channelBadge,
                        background: CHANNEL_LABEL[s.channel].color,
                        color: CHANNEL_LABEL[s.channel].textColor || "#fff"}}>
                        {CHANNEL_LABEL[s.channel][lang]}
                      </div>
                      {s.name.note && <div style={{fontSize:10,color:"#f5d020",marginTop:5,lineHeight:1.3}}>📋 {s.name.note}</div>}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div style={styles.backRow}>
                  <button style={styles.backBtn} onClick={()=>setSelectedSupplier(null)}>← {t("뒤로","Zurück")}</button>
                  <div style={{...styles.supplierTag, background: selectedSupplier.color}}>
                    {selectedSupplier.icon} {selectedSupplier.name[lang]}
                  </div>
                </div>
                {selectedSupplier.name.note && (
                  <div style={{background:"#1e1c10",border:"1px solid #3a3416",borderRadius:8,padding:"7px 10px",marginBottom:12,fontSize:12,color:"#f5d020"}}>
                    📋 {selectedSupplier.name.note}
                  </div>
                )}
                <div style={styles.sectionTitle}>{t("수량 입력","Menge eingeben")}</div>
                {totalItems === 0 && (() => {
                  const lastOrder = orders.find(o => o.supplier === selectedSupplier.id);
                  if (!lastOrder) return null;
                  return (
                    <button style={{...styles.ghostBtn, marginBottom:10}} onClick={()=>{
                      const valid = {};
                      (selectedSupplier.items||[]).forEach(it => {
                        if (lastOrder.quantities?.[it.id] > 0) valid[it.id] = lastOrder.quantities[it.id];
                      });
                      setQuantities(valid);
                    }}>
                      ↺ {t("지난 발주 불러오기","Letzte Bestellung laden")} ({new Date(lastOrder.date).toLocaleDateString(lang==="ko"?"ko-KR":"de-DE")})
                    </button>
                  );
                })()}
                <input
                  style={{...styles.input, marginBottom:10, fontSize:13}}
                  type="text"
                  placeholder={t("품목 검색...","Artikel suchen...")}
                  value={itemSearch}
                  onChange={e=>setItemSearch(e.target.value)}
                />
                <div style={styles.itemList}>
                  {(selectedSupplier.items||[]).filter(item=> {
                    if (!itemSearch) return true;
                    const q = itemSearch.toLowerCase();
                    return (item.name.de||"").toLowerCase().includes(q) || (item.name.ko||"").toLowerCase().includes(q);
                  }).map(item => (
                    <div key={item.id} style={{...styles.itemRow, background: quantities[item.id]>0?"#1a2a1a":"#1a1a2a"}}>
                      <div style={styles.itemName}>
                        <span>{selectedSupplier.id === "panasia" ? item.name[lang] : item.name.de}</span>
                        <span style={styles.itemUnit}>{item.unit}</span>
                      </div>
                      <div style={styles.qtyControl}>
                        <button style={styles.qtyBtn} onClick={()=>handleQty(item.id,(quantities[item.id]||0)-1)}>−</button>
                        <input
                          style={styles.qtyInput}
                          type="number" min="0"
                          value={quantities[item.id] || ""}
                          placeholder="0"
                          onChange={e=>handleQty(item.id, e.target.value)}
                        />
                        <button style={styles.qtyBtn} onClick={()=>handleQty(item.id,(quantities[item.id]||0)+1)}>+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.noteWrap}>
                  <div style={styles.sectionTitle}>{t("메모 (선택)","Notiz (optional)")}</div>
                  <textarea style={styles.textarea}
                    placeholder={t("추가 요청사항","Besondere Anforderungen")}
                    value={note} onChange={e=>setNote(e.target.value)} rows={3}/>
                </div>

                {totalItems > 0 && (
                  <div style={styles.previewBox}>
                    <div style={styles.previewTitle}>📄 {t("발주서 미리보기","Vorschau")}</div>
                    <pre style={styles.previewText}>
                      {buildOrderMessage(selectedSupplier, quantities, lang, currentUser.name, note)}
                    </pre>
                  </div>
                )}

                <div style={{position:"sticky",bottom:0,padding:"8px 0 12px",background:"linear-gradient(transparent, #0f0f18 35%)"}}>
                  <button
                    style={{...(totalItems>0 ? styles.primaryBtn : styles.disabledBtn), marginBottom:0}}
                    disabled={totalItems===0}
                    onClick={handleSubmitOrder}>
                    📤 {t(`발주서 전송 (${totalItems}개 품목)`, `Bestellung senden (${totalItems} Artikel)`)}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {page === "order" && submitted && (
          <div style={styles.successWrap}>
            <div style={styles.successIcon}>✅</div>
            <div style={styles.successTitle}>{t("발주서 전송 완료!","Bestellung gesendet!")}</div>
            <div style={styles.successSub}>
              {t("사장님(Seungjae)께 WhatsApp으로 전달되었습니다.","Die Bestellung wurde per WhatsApp an Seungjae gesendet.")}
            </div>
            <button style={styles.primaryBtn} onClick={handleNewOrder}>
              {t("새 발주서 작성","Neue Bestellung")}
            </button>
            <button style={styles.ghostBtn} onClick={()=>setPage("history")}>
              {t("발주 이력 보기","Verlauf anzeigen")}
            </button>
          </div>
        )}

        {page === "history" && (
          <div>
            <div style={styles.sectionTitle}>
              {t("발주 이력","Bestellhistorie")}
              <span style={{fontSize:13,fontWeight:400,color:"#888",marginLeft:8}}>({orders.length}{t("건","Einträge")})</span>
            </div>
            {ordersLoading && (
              <div style={styles.emptyState}>{t("불러오는 중...","Wird geladen...")}</div>
            )}
            {!ordersLoading && orders.length === 0 && (
              <div style={styles.emptyState}>{t("발주 이력이 없습니다.","Keine Bestellungen vorhanden.")}</div>
            )}
            {orders.map(order => {
              const sup = suppliers.find(s=>s.id===order.supplier);
              return (
                <div key={order.id} style={{...styles.historyCard, borderLeft: `4px solid ${sup?.color||"#444"}`}}>
                  <div style={styles.historyTop}>
                    <div>
                      <span style={styles.historySupplier}>{sup?.icon} {typeof order.supplierName === "object" ? order.supplierName[lang] : order.supplierName}</span>
                      <span style={{...styles.statusBadge, background: order.status==="sent"?"#059669":"#d97706"}}>
                        {order.status==="sent" ? t("전송완료","Gesendet") : t("대기중","Ausstehend")}
                      </span>
                    </div>
                    <div style={styles.historyDate}>{new Date(order.date).toLocaleDateString(lang==="ko"?"ko-KR":"de-DE")}</div>
                  </div>
                  <div style={styles.historyStaff}>👤 {order.staffName}</div>
                  <pre style={styles.historyMsg}>{order.message}</pre>
                  <div style={styles.historyActions}>
                    <button style={styles.copyBtn} onClick={()=>handleCopyMessage(order.message, order.id)}>
                      {copiedMsg===order.id ? t("✅ 복사됨","✅ Kopiert") : t("📋 복사","📋 Kopieren")}
                    </button>
                    {order.status==="pending" && currentUser.role==="owner" && (
                      <button style={styles.doneBtn} onClick={()=>handleMarkDone(order.id)}>
                        {t("✓ 전송완료","✓ Gesendet")}
                      </button>
                    )}
                    {currentUser.role==="owner" && (
                      <button style={styles.deleteBtn} onClick={()=>handleDeleteOrder(order.id)}>
                        {t("🗑 삭제","🗑 Löschen")}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {page === "settings" && currentUser.role === "owner" && (
          <div>
            <div style={styles.sectionTitle}>⚙️ {t("설정","Einstellungen")}</div>

            {/* 탭 네비게이션 */}
            {settingsView !== "items" && (
              <div style={{display:"flex",gap:6,marginBottom:14}}>
                <button
                  style={settingsView==="list"?styles.navActive:styles.navBtn}
                  onClick={()=>setSettingsView("list")}
                >📦 {t("공급업체","Lieferanten")}</button>
                <button
                  style={settingsView==="staff"?styles.navActive:styles.navBtn}
                  onClick={()=>{ setSettingsView("staff"); loadStaff(); }}
                >👥 {t("직원","Personal")}</button>
              </div>
            )}

            {settingsView === "list" && (
              <>
                <div style={{marginBottom:12,fontSize:13,color:"#aaa"}}>{t("공급업체를 선택해 품목을 관리하세요","Lieferant auswählen zum Verwalten")}</div>
                {suppliers.map(s => (
                  <div key={s.id} style={{...styles.historyCard, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:20}}>{s.icon}</span>
                      <div>
                        <div style={{fontWeight:600,fontSize:13,color:"#e8e8f0"}}>{s.name[lang]}</div>
                        <div style={{fontSize:11,color:"#888"}}>{s.items.length}{t("개 품목","Artikel")}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button style={styles.copyBtn} onClick={()=>{setEditingSupplier(s);setSettingsView("items");setNewItemForm({name_ko:"",name_de:"",unit:""});setSupplierNoteDraft(s.name.note||"");setNoteSaved(false);}}>
                        {t("품목 관리","Artikel")}
                      </button>
                      <button style={{...styles.copyBtn,background:"#2a1a1a",color:"#e87a7a"}} onClick={()=>{
                        if(window.confirm(t("삭제하시겠습니까?","Löschen?"))) {
                          setSuppliers(prev=>prev.filter(x=>x.id!==s.id));
                          supabase.from("suppliers").delete().eq("id",s.id).then(({error})=>{ if(error) console.error("Supabase supplier delete error:",error); });
                        }
                      }}>✕</button>
                    </div>
                  </div>
                ))}
                <div style={{...styles.historyCard,marginTop:16}}>
                  <div style={{fontWeight:600,fontSize:13,color:"#e8e8f0",marginBottom:10}}>➕ {t("새 공급업체 추가","Neuer Lieferant")}</div>
                  <input style={{...styles.input,marginBottom:6}} placeholder={t("공급업체명 (한국어)","Name (Koreanisch)")} value={newSupplierForm.name_ko} onChange={e=>setNewSupplierForm(p=>({...p,name_ko:e.target.value}))} />
                  <input style={{...styles.input,marginBottom:6}} placeholder="Name (Deutsch)" value={newSupplierForm.name_de} onChange={e=>setNewSupplierForm(p=>({...p,name_de:e.target.value}))} />
                  <div style={{display:"flex",gap:6,marginBottom:6}}>
                    <input style={{...styles.input,flex:1,margin:0}} placeholder={t("아이콘","Icon")} value={newSupplierForm.icon} onChange={e=>setNewSupplierForm(p=>({...p,icon:e.target.value}))} />
                    <input style={{...styles.input,flex:1,margin:0}} placeholder="Color #hex" value={newSupplierForm.color} onChange={e=>setNewSupplierForm(p=>({...p,color:e.target.value}))} />
                  </div>
                  <select style={{...styles.input,marginBottom:8}} value={newSupplierForm.channel} onChange={e=>setNewSupplierForm(p=>({...p,channel:e.target.value}))}>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="kakao">KakaoTalk</option>
                    <option value="web">{t("웹 주문","Web-Bestellung")}</option>
                    <option value="app">{t("앱 주문","App-Bestellung")}</option>
                  </select>
                  <button style={styles.primaryBtn} onClick={()=>{
                    if(!newSupplierForm.name_ko) return;
                    const newS = {
                      id: "s_"+Date.now(),
                      name:{ko:newSupplierForm.name_ko, de:newSupplierForm.name_de||newSupplierForm.name_ko},
                      channel:newSupplierForm.channel,
                      color:newSupplierForm.color||"#888",
                      icon:newSupplierForm.icon||"📦",
                      items:[]
                    };
                    setSuppliers(prev=>[...prev,newS]);
                    syncSupplierToDb(newS);
                    setNewSupplierForm({name_ko:"",name_de:"",channel:"whatsapp",icon:"📦",color:"#888888"});
                  }}>{t("추가","Hinzufügen")}</button>
                </div>
              </>
            )}

            {settingsView === "items" && editingSupplier && (
              <>
                <button style={styles.backBtn} onClick={()=>setSettingsView("list")}>← {t("목록으로","Zurück")}</button>
                <div style={{fontWeight:700,fontSize:15,color:editingSupplier.color,margin:"12px 0 8px"}}>
                  {editingSupplier.icon} {editingSupplier.name[lang]}
                </div>
                <div style={{...styles.historyCard,marginBottom:10}}>
                  <div style={{fontWeight:600,fontSize:12,color:"#e8e8f0",marginBottom:6}}>📋 {t("발주 안내 (발주 화면에 표시)","Bestellhinweis (wird beim Bestellen angezeigt)")}</div>
                  <input
                    style={{...styles.input,marginBottom:6}}
                    placeholder={t("예: 화·금 주문 → 익일 배송","z.B. Di & Fr bestellen → Lieferung am nächsten Tag")}
                    value={supplierNoteDraft}
                    onChange={e=>{setSupplierNoteDraft(e.target.value);setNoteSaved(false);}}
                  />
                  <button style={styles.copyBtn} onClick={()=>{
                    const curSup = suppliers.find(s=>s.id===editingSupplier.id);
                    if (!curSup) return;
                    const updatedSup = {...curSup, name:{...curSup.name, note: supplierNoteDraft.trim()}};
                    setSuppliers(prev=>prev.map(s=>s.id===editingSupplier.id?updatedSup:s));
                    syncSupplierToDb(updatedSup);
                    setNoteSaved(true);
                  }}>{noteSaved ? t("✅ 저장됨","✅ Gespeichert") : t("저장","Speichern")}</button>
                </div>
                {suppliers.find(s=>s.id===editingSupplier.id)?.items.map((item,idx) => (
                  <div key={item.id} style={{...styles.itemRow, marginBottom:6}}>
                    {editingItem?.id===item.id ? (
                      <div style={{width:"100%"}}>
                        <input style={{...styles.input,marginBottom:4}} value={editingItem.name.ko} onChange={e=>setEditingItem(p=>({...p,name:{...p.name,ko:e.target.value}}))} placeholder={t("품목명(한국어)","Name KO")} />
                        <input style={{...styles.input,marginBottom:4}} value={editingItem.name.de} onChange={e=>setEditingItem(p=>({...p,name:{...p.name,de:e.target.value}}))} placeholder="Name DE" />
                        <input style={{...styles.input,marginBottom:6}} value={editingItem.unit} onChange={e=>setEditingItem(p=>({...p,unit:e.target.value}))} placeholder={t("단위","Einheit")} />
                        <div style={{display:"flex",gap:6}}>
                          <button style={{...styles.doneBtn,flex:1}} onClick={()=>{
                            const foundSup = suppliers.find(s=>s.id===editingSupplier.id);
                            if (!foundSup) return;
                            const updatedSup = {...foundSup};
                            updatedSup.items = updatedSup.items.map(it=>it.id===editingItem.id?editingItem:it);
                            setSuppliers(prev=>prev.map(s=>s.id===editingSupplier.id?updatedSup:s));
                            syncSupplierToDb(updatedSup);
                            setEditingItem(null);
                          }}>{t("저장","Speichern")}</button>
                          <button style={styles.copyBtn} onClick={()=>setEditingItem(null)}>{t("취소","Abbrechen")}</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={styles.itemName}>
                          <span style={{fontSize:13}}>{editingSupplier.id === "panasia" ? item.name[lang] : item.name.de}</span>
                          <span style={styles.itemUnit}>{item.unit}</span>
                        </div>
                        <div style={{display:"flex",gap:5}}>
                          <button style={styles.copyBtn} onClick={()=>setEditingItem({...item})}>{t("수정","Edit")}</button>
                          <button style={{...styles.copyBtn,background:"#2a1a1a",color:"#e87a7a"}} onClick={()=>{
                            const foundSup2 = suppliers.find(s=>s.id===editingSupplier.id);
                            if (!foundSup2) return;
                            const updatedSup = {...foundSup2};
                            updatedSup.items = updatedSup.items.filter(it=>it.id!==item.id);
                            setSuppliers(prev=>prev.map(s=>s.id===editingSupplier.id?updatedSup:s));
                            syncSupplierToDb(updatedSup);
                          }}>✕</button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                <div style={{...styles.historyCard,marginTop:12}}>
                  <div style={{fontWeight:600,fontSize:13,color:"#e8e8f0",marginBottom:8}}>➕ {t("품목 추가","Artikel hinzufügen")}</div>
                  <input style={{...styles.input,marginBottom:5}} placeholder={t("품목명 (한국어)","Name (Koreanisch)")} value={newItemForm.name_ko} onChange={e=>setNewItemForm(p=>({...p,name_ko:e.target.value}))} />
                  <input style={{...styles.input,marginBottom:5}} placeholder="Name (Deutsch)" value={newItemForm.name_de} onChange={e=>setNewItemForm(p=>({...p,name_de:e.target.value}))} />
                  <input style={{...styles.input,marginBottom:8}} placeholder={t("단위 (예: kg, Kiste)","Einheit (z.B. kg, Kiste)")} value={newItemForm.unit} onChange={e=>setNewItemForm(p=>({...p,unit:e.target.value}))} />
                  <button style={styles.primaryBtn} onClick={()=>{
                    if(!newItemForm.name_ko) return;
                    const newItem = {
                      id:"item_"+Date.now(),
                      name:{ko:newItemForm.name_ko, de:newItemForm.name_de||newItemForm.name_ko},
                      unit:newItemForm.unit||"Stk"
                    };
                    const curSup = suppliers.find(s=>s.id===editingSupplier.id);
                    if (!curSup) return;
                    const updatedSup = {...curSup, items:[...curSup.items, newItem]};
                    setSuppliers(prev=>prev.map(s=>s.id===editingSupplier.id?updatedSup:s));
                    syncSupplierToDb(updatedSup);
                    setNewItemForm({name_ko:"",name_de:"",unit:""});
                  }}>{t("추가","Hinzufügen")}</button>
                </div>
              </>
            )}

            {settingsView === "staff" && (
              <>
                {staffLoading ? (
                  <div style={{color:"#888",fontSize:13,textAlign:"center",padding:20}}>{t("불러오는 중...","Laden...")}</div>
                ) : (
                  staffUsers.map(user => (
                    <div key={user.id} style={{...styles.historyCard, display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8}}>
                      <div>
                        <div style={{fontWeight:600,fontSize:13,color:"#e8e8f0"}}>{user.name}</div>
                        <div style={{fontSize:11,color:"#888"}}>{user.email}</div>
                        {user.role === "owner" && <div style={{fontSize:10,color:"#f5a623",marginTop:2}}>👑 {t("관리자","Admin")}</div>}
                      </div>
                      {user.role !== "owner" && (
                        <button
                          style={{...styles.copyBtn,background:"#2a1a1a",color:"#e87a7a"}}
                          onClick={()=>handleRemoveStaff(user)}
                        >✕</button>
                      )}
                    </div>
                  ))
                )}
                <div style={{...styles.historyCard,marginTop:16}}>
                  <div style={{fontWeight:600,fontSize:13,color:"#e8e8f0",marginBottom:10}}>➕ {t("새 직원 추가","Neuen Mitarbeiter hinzufügen")}</div>
                  <input
                    style={{...styles.input,marginBottom:6}}
                    placeholder={t("이름","Name")}
                    value={newStaffForm.name}
                    onChange={e=>setNewStaffForm(p=>({...p,name:e.target.value}))}
                  />
                  <input
                    style={{...styles.input,marginBottom:8}}
                    type="email"
                    placeholder={t("이메일 주소","E-Mail-Adresse")}
                    value={newStaffForm.email}
                    onChange={e=>setNewStaffForm(p=>({...p,email:e.target.value}))}
                    onKeyDown={e=>e.key==="Enter"&&handleAddStaff()}
                  />
                  {staffError && <div style={{...styles.error,marginBottom:8}}>{staffError}</div>}
                  <button style={styles.primaryBtn} onClick={handleAddStaff}>
                    {t("추가","Hinzufügen")}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  app: { minHeight:"100vh", background:"#0f0f18", color:"#e8e8f0", fontFamily:"'Noto Sans KR','Noto Sans',sans-serif", overflowX:"hidden", width:"100%", maxWidth:600, margin:"0 auto" },
  loginWrap: { minHeight:"100vh", background:"#0f0f18", display:"flex", alignItems:"center", justifyContent:"center", padding:16 },
  loginCard: { background:"#1a1a2e", border:"1px solid #2a2a4a", borderRadius:20, padding:"36px 28px", width:"100%", maxWidth:360, textAlign:"center" },
  logo: { width:120, height:120, objectFit:"contain", borderRadius:12, display:"block", margin:"0 auto 12px auto" },
  loginTitle: { fontSize:20, fontWeight:700, color:"#e8e8f0", marginBottom:6, lineHeight:1.4 },
  loginSub: { fontSize:13, color:"#888", fontWeight:400 },
  langRow: { display:"flex", gap:8, justifyContent:"center", margin:"14px 0" },
  langBtn: { background:"transparent", border:"1px solid #333", color:"#888", borderRadius:20, padding:"6px 16px", cursor:"pointer", fontSize:13 },
  langActive: { background:"#fff", border:"1px solid #fff", color:"#000", borderRadius:20, padding:"6px 16px", cursor:"pointer", fontSize:13, fontWeight:700 },
  input: { width:"100%", background:"#0f0f18", border:"1px solid #2a2a4a", borderRadius:10, padding:"12px 16px", color:"#e8e8f0", fontSize:15, marginBottom:8, boxSizing:"border-box" },
  error: { color:"#e8472a", fontSize:13, marginBottom:8 },
  primaryBtn: { width:"100%", background:"#fff", border:"none", borderRadius:12, padding:"14px", color:"#000", fontSize:16, fontWeight:700, cursor:"pointer", marginBottom:8 },
  disabledBtn: { width:"100%", background:"#2a2a3a", border:"none", borderRadius:12, padding:"14px", color:"#555", fontSize:16, fontWeight:700, cursor:"not-allowed", marginBottom:8 },
  ghostBtn: { width:"100%", background:"transparent", border:"1px solid #333", borderRadius:12, padding:"12px", color:"#aaa", fontSize:14, cursor:"pointer", marginBottom:8 },
  header: { background:"#13131f", borderBottom:"1px solid #1e1e30", padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10 },
  headerLeft: { display:"flex", alignItems:"center", gap:10 },
  headerLogo: { width:36, height:36, objectFit:"contain", borderRadius:6 },
  headerTitle: { fontSize:16, fontWeight:700, color:"#e8e8f0" },
  headerUser: { fontSize:11, color:"#888" },
  headerRight: { display:"flex", alignItems:"center", gap:8 },
  logoutBtn: { background:"transparent", border:"1px solid #333", color:"#888", borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:12 },
  nav: { background:"#13131f", borderBottom:"1px solid #1e1e30", display:"flex", padding:"0 8px", width:"100%", boxSizing:"border-box", overflowX:"auto", WebkitOverflowScrolling:"touch" },
  navBtn: { flex:"0 0 auto", background:"transparent", border:"none", borderBottom:"3px solid transparent", color:"#888", padding:"13px 10px", cursor:"pointer", fontSize:12, position:"relative", whiteSpace:"nowrap" },
  navActive: { flex:"0 0 auto", background:"transparent", border:"none", borderBottom:"3px solid #fff", color:"#e8e8f0", padding:"13px 10px", cursor:"pointer", fontSize:12, fontWeight:600, position:"relative", whiteSpace:"nowrap" },
  badge: { background:"#e8472a", color:"#fff", borderRadius:10, padding:"1px 6px", fontSize:11, marginLeft:6 },
  main: { padding:16, maxWidth:600, margin:"0 auto" },
  sectionTitle: { fontSize:14, fontWeight:700, color:"#c8c8d8", marginBottom:12, marginTop:8 },
  supplierGrid: { display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 },
  supplierCard: { background:"#1a1a2e", border:"2px solid", borderRadius:14, padding:"18px 10px", cursor:"pointer", textAlign:"center" },
  supplierIcon: { fontSize:28, marginBottom:6 },
  supplierName: { fontSize:12, fontWeight:600, color:"#e8e8f0", marginBottom:7, lineHeight:1.3 },
  channelBadge: { display:"inline-block", borderRadius:10, padding:"3px 8px", fontSize:11, fontWeight:600 },
  backRow: { display:"flex", alignItems:"center", gap:10, marginBottom:14 },
  backBtn: { background:"transparent", border:"1px solid #333", color:"#aaa", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:13 },
  supplierTag: { borderRadius:18, padding:"4px 12px", color:"#fff", fontSize:13, fontWeight:600 },
  itemList: { display:"flex", flexDirection:"column", gap:8, marginBottom:14 },
  itemRow: { display:"flex", alignItems:"center", justifyContent:"space-between", borderRadius:10, padding:"11px 13px", border:"1px solid #2a2a3a" },
  itemName: { display:"flex", flexDirection:"column", gap:2 },
  itemUnit: { fontSize:11, color:"#666" },
  qtyControl: { display:"flex", alignItems:"center", gap:6 },
  qtyBtn: { background:"#2a2a3a", border:"none", color:"#e8e8f0", borderRadius:8, width:30, height:30, cursor:"pointer", fontSize:16 },
  qtyInput: { background:"#0f0f18", border:"1px solid #333", borderRadius:8, color:"#e8e8f0", width:48, textAlign:"center", padding:"5px 2px", fontSize:14 },
  noteWrap: { marginBottom:14 },
  textarea: { width:"100%", background:"#1a1a2e", border:"1px solid #2a2a3a", borderRadius:10, color:"#e8e8f0", padding:"10px 12px", fontSize:14, boxSizing:"border-box", resize:"vertical" },
  previewBox: { background:"#0f1a0f", border:"1px solid #1a3a1a", borderRadius:10, padding:12, marginBottom:14 },
  previewTitle: { fontSize:12, color:"#4ade80", marginBottom:6, fontWeight:600 },
  previewText: { fontSize:12, color:"#a8d8a8", margin:0, whiteSpace:"pre-wrap", fontFamily:"monospace" },
  successWrap: { textAlign:"center", padding:"40px 16px" },
  successIcon: { fontSize:56, marginBottom:14 },
  successTitle: { fontSize:20, fontWeight:700, color:"#4ade80", marginBottom:8 },
  successSub: { color:"#888", fontSize:13, marginBottom:22 },
  emptyState: { textAlign:"center", color:"#555", padding:"40px 0" },
  historyCard: { background:"#1a1a2e", borderRadius:10, padding:13, marginBottom:10, border:"1px solid #2a2a3a" },
  historyTop: { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 },
  historySupplier: { fontSize:13, fontWeight:600, color:"#e8e8f0" },
  statusBadge: { borderRadius:8, padding:"2px 7px", fontSize:11, fontWeight:600, color:"#fff", marginLeft:7 },
  historyDate: { fontSize:11, color:"#666" },
  historyStaff: { fontSize:11, color:"#888", marginBottom:7 },
  historyMsg: { background:"#0f0f18", borderRadius:7, padding:9, fontSize:11, color:"#a8a8c8", margin:"7px 0", whiteSpace:"pre-wrap", fontFamily:"monospace" },
  historyActions: { display:"flex", gap:7, marginTop:7 },
  copyBtn: { background:"#2a2a3a", border:"none", color:"#e8e8f0", borderRadius:7, padding:"7px 12px", cursor:"pointer", fontSize:12 },
  doneBtn: { background:"#059669", border:"none", color:"#fff", borderRadius:7, padding:"7px 12px", cursor:"pointer", fontSize:12, fontWeight:600 },
  deleteBtn: { background:"#2a1a1a", border:"none", color:"#e87a7a", borderRadius:7, padding:"7px 12px", cursor:"pointer", fontSize:12 },
};
