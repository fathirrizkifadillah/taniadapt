import {
  ActionType,
  StatusLevel,
  HourlyWeather,
  ActionEvaluation,
  HourlyStatus,
  AgroAdvisory,
  WeatherData,
  ACTION_META,
} from './types';

// --- Helpers ---

function sumPrecipitation(hourlyData: HourlyWeather[], fromIndex: number, hours: number): number {
  let sum = 0;
  const limit = Math.min(fromIndex + hours, hourlyData.length);
  for (let i = fromIndex; i < limit; i++) {
    sum += hourlyData[i].precipitation ?? 0;
  }
  return sum;
}

function maxPrecipProbability(hourlyData: HourlyWeather[], fromIndex: number, hours: number): number {
  let max = 0;
  const limit = Math.min(fromIndex + hours, hourlyData.length);
  for (let i = fromIndex; i < limit; i++) {
    const prob = hourlyData[i].precipitation_probability ?? 0;
    if (prob > max) max = prob;
  }
  return max;
}

export function getStatusLabel(status: StatusLevel): string {
  switch (status) {
    case 'SAFE': return 'Sangat Aman';
    case 'WARN': return 'Perlu Waspada';
    case 'DANGER': return 'Hindari';
  }
}

function formatHour(isoTime: string): string {
  const d = new Date(isoTime);
  return `${d.getHours().toString().padStart(2, '0')}.00`;
}

function findBestWindow(action: ActionType, timeline: HourlyStatus[]): string {
  const safeItems = timeline.filter((item) => item.status === 'SAFE');

  if (safeItems.length === 0) {
    return 'Belum ada waktu aman';
  }

  // Realistic agronomic golden morning windows per action
  let preferredStart = 6;
  let preferredEnd = 9;
  if (action === 'spraying') {
    preferredStart = 7;
    preferredEnd = 11;
  } else if (action === 'harvesting') {
    preferredStart = 8;
    preferredEnd = 11;
  }

  // Prefer morning safe window
  const morningSafe = timeline.filter((item) => {
    const h = parseInt(item.hour);
    return item.status === 'SAFE' && h >= preferredStart && h <= preferredEnd;
  });

  const candidates = morningSafe.length > 0 ? morningSafe : safeItems;
  const startHour = candidates[0].hour;
  const startNum = parseInt(startHour);
  const endNum = Math.min(startNum + Math.min(2, candidates.length), 18);
  const endHour = `${endNum.toString().padStart(2, '0')}.00`;

  return `${startHour} \u2013 ${endHour} WIB`;
}

function generateFieldNote(
  action: ActionType,
  status: StatusLevel,
  timeline: HourlyStatus[]
): string {
  // Check for specific danger alerts later in the day
  const dangerHour = timeline.find((t) => t.status === 'DANGER');
  if (dangerHour) {
    if (action === 'spraying' && dangerHour.reason.includes('hujan')) {
      return `Risiko hujan membilas obat. Periksa kembali sekitar pukul ${dangerHour.hour}.`;
    }
    if (action === 'harvesting' && dangerHour.reason.includes('basah')) {
      return `Hasil panen berisiko basah. Periksa kembali sekitar pukul ${dangerHour.hour}.`;
    }
  }

  // Contextual supportive or cautionary note matching screenshots
  const warnHour = timeline.find((t) => t.status === 'WARN');
  if (action === 'irrigation') {
    return warnHour ? `Kondisi mendukung. ${warnHour.reason}.` : 'Kondisi mendukung. Tanah siap disiram.';
  }
  if (action === 'fertilizing') {
    return warnHour ? `Kondisi mendukung. ${warnHour.reason}.` : 'Kondisi mendukung. Tanah siap menerima pupuk.';
  }
  if (action === 'pruning') {
    return 'Kondisi mendukung. Luka pangkas dapat mengering.';
  }
  if (action === 'spraying') {
    return warnHour ? `Kondisi mendukung. ${warnHour.reason}.` : 'Kondisi mendukung. Angin tenang dan aman.';
  }
  if (action === 'harvesting') {
    return warnHour ? `Kondisi mendukung. ${warnHour.reason}.` : 'Kondisi mendukung. Hasil panen kering optimal.';
  }

  return 'Kondisi bervariasi. Perhatikan jadwal per jam.';
}

// --- Per-Action Evaluators ---

function evaluateSpraying(hourData: HourlyWeather, index: number, allData: HourlyWeather[]): { status: StatusLevel; reason: string } {
  const precipProbNext3 = maxPrecipProbability(allData, index, 3);
  const precipNext3 = sumPrecipitation(allData, index, 3);
  const wind = hourData.wind_speed_10m ?? 0;
  const temp = hourData.temperature_2m ?? 0;

  if (precipProbNext3 > 30 || precipNext3 >= 1.0) {
    return { status: 'DANGER', reason: 'Risiko hujan membilas obat' };
  } else if (wind > 15.0) {
    return { status: 'DANGER', reason: 'Angin terlalu kencang' };
  } else if (wind >= 3.0 && wind <= 12.0 && temp < 30.0) {
    return { status: 'SAFE', reason: `Ideal - angin ${Math.round(wind)} km/j` };
  } else if (temp >= 30.0) {
    return { status: 'WARN', reason: 'Suhu mulai terik' };
  } else {
    return { status: 'WARN', reason: 'Kondisi belum optimal' };
  }
}

function evaluateFertilizing(hourData: HourlyWeather, index: number, allData: HourlyWeather[]): { status: StatusLevel; reason: string } {
  const precipNext12 = sumPrecipitation(allData, index, 12);
  const moisture = hourData.soil_moisture_0_to_7cm ?? 0;

  if (precipNext12 >= 8.0 || moisture > 0.85) {
    return { status: 'DANGER', reason: 'Risiko pupuk hanyut' };
  } else if (moisture < 0.30) {
    return { status: 'WARN', reason: 'Tanah terlalu kering' };
  } else {
    return { status: 'SAFE', reason: 'Tanah siap menerima pupuk' };
  }
}

function evaluateIrrigation(hourData: HourlyWeather, index: number, allData: HourlyWeather[]): { status: StatusLevel; reason: string } {
  const moisture = hourData.soil_moisture_0_to_7cm ?? 0;
  const precipNext6 = sumPrecipitation(allData, index, 6);
  const hour = new Date(hourData.time).getHours();
  const radiation = hourData.shortwave_radiation ?? 0;

  if (moisture >= 0.70 || precipNext6 >= 3.0) {
    return { status: 'DANGER', reason: 'Tanah sudah jenuh air' };
  } else if (hour >= 11 && hour <= 14 && radiation > 600) {
    return { status: 'WARN', reason: 'Air cepat menguap' };
  } else {
    return { status: 'SAFE', reason: 'Waktu siram yang baik' };
  }
}

function evaluateHarvesting(hourData: HourlyWeather, index: number, allData: HourlyWeather[]): { status: StatusLevel; reason: string } {
  const precipCurrent = hourData.precipitation ?? 0;
  const humidity = hourData.relative_humidity_2m ?? 0;
  const precipNext6 = sumPrecipitation(allData, index, 6);
  const hour = new Date(hourData.time).getHours();

  if (precipCurrent > 0 || humidity > 85) {
    return { status: 'DANGER', reason: 'Hasil panen berisiko basah' };
  } else if (hour >= 8 && humidity <= 75 && precipNext6 === 0) {
    return { status: 'SAFE', reason: 'Kering dan siap dipanen' };
  } else {
    return { status: 'WARN', reason: 'Tunggu embun mengering' };
  }
}

function evaluatePruning(hourData: HourlyWeather, index: number, allData: HourlyWeather[]): { status: StatusLevel; reason: string } {
  const precipNext8 = sumPrecipitation(allData, index, 8);

  if (precipNext8 >= 2.0) {
    return { status: 'DANGER', reason: 'Luka basah rentan jamur' };
  } else {
    return { status: 'SAFE', reason: 'Luka pangkas dapat mengering' };
  }
}

// --- Voice Instruction Generator per Action ---

function generateActionVoiceInstruction(
  action: ActionType,
  status: StatusLevel,
  bestWindow: string,
  fieldNote: string,
  timeline: HourlyStatus[]
): string {
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : 'Selamat sore';
  const cleanWindow = bestWindow.replace(' WIB', '');

  switch (action) {
    case 'irrigation': {
      if (status === 'SAFE') {
        return `${greeting} Pak. Untuk aktivitas menyiram tanaman hari ini kondisinya sangat aman. Waktu terbaik menyiram adalah antara jam ${cleanWindow}. ${fieldNote} Disarankan menyiram pada pagi hari agar air terserap maksimal oleh akar.`;
      } else if (status === 'WARN') {
        return `${greeting} Pak. Untuk menyiram tanaman hari ini perlu waspada. ${fieldNote} Waktu terbaik yang dianjurkan adalah antara jam ${cleanWindow}. Hindari menyiram di siang bolong karena air akan cepat menguap sia-sia.`;
      } else {
        return `Peringatan Pak. Hari ini tidak disarankan menyiram tanaman. ${fieldNote} Tanah sudah jenuh air atau diprediksi akan turun hujan, menyiram berisiko memicu pembusukan akar.`;
      }
    }

    case 'fertilizing': {
      if (status === 'SAFE') {
        return `${greeting} Pak. Kondisi hari ini sangat aman untuk pemupukan tanah. Waktu terbaik menabur pupuk adalah antara jam ${cleanWindow}. Kelembapan tanah memadai dan tidak ada potensi hujan lebat yang dapat menghanyutkan pupuk.`;
      } else if (status === 'WARN') {
        const windowText =
          bestWindow === 'Belum ada waktu aman'
            ? 'saat ini belum ada waktu yang aman untuk menabur pupuk'
            : `waktu yang disarankan antara jam ${cleanWindow}`;
        return `${greeting} Pak. Untuk pemupukan tanah hari ini perlu waspada. ${fieldNote}. Kondisi tanah saat ini kurang ideal sehingga ${windowText}. Sebaiknya siram sedikit tanah atau tunggu kelembapan ideal agar pupuk dapat diserap akar.`;
      } else {
        return `Peringatan penting Pak. Tunda pemupukan tanah hari ini karena risiko tinggi pupuk hanyut terbawa aliran air. ${fieldNote}. Taburkan pupuk kembali saat cuaca cerah dan tanah tidak tergenang.`;
      }
    }

    case 'spraying': {
      if (status === 'SAFE') {
        return `${greeting} Pak. Hari ini kondisi sangat aman untuk menyemprot hama tanaman. Waktu terbaik penyemprotan adalah antara jam ${cleanWindow} karena angin bertiup tenang dan daun sudah kering dari embun. Namun perhatikan, ${fieldNote}`;
      } else if (status === 'WARN') {
        return `${greeting} Pak. Untuk menyemprot hama hari ini harap berhati-hati. ${fieldNote}. Jika mendesak, lakukan pada rentang jam ${cleanWindow} saat angin tidak kencang dan suhu belum terik.`;
      } else {
        return `Perhatian Pak. Jangan lakukan penyemprotan hama hari ini. ${fieldNote}. Angin kencang atau potensi hujan lebat dapat membuat pestisida terbilas percuma dan terbawa angin.`;
      }
    }

    case 'harvesting': {
      if (status === 'SAFE') {
        return `${greeting} Pak. Hari ini kondisi sangat aman dan ideal untuk memanen. Waktu panen terbaik adalah antara jam ${cleanWindow} saat embun pagi telah kering sempurna. ${fieldNote}`;
      } else if (status === 'WARN') {
        return `${greeting} Pak. Untuk memanen hasil tani hari ini perlu waspada. ${fieldNote}. Sebaiknya tunggu sampai sinar matahari mengeringkan komoditas sebelum dipetik agar tidak membusuk saat disimpan. Waktu yang disarankan antara jam ${cleanWindow}.`;
      } else {
        return `Peringatan Pak. Tunda pemetikan atau pemanenan hari ini. ${fieldNote}. Memanen saat tanaman atau buah basah sangat berisiko memicu infeksi jamur dan pembusukan pascapanen.`;
      }
    }

    case 'pruning': {
      if (status === 'SAFE') {
        return `${greeting} Pak. Hari ini kondisi sangat aman untuk merawat dan memangkas tanaman. Waktu terbaik adalah antara jam ${cleanWindow}. ${fieldNote} Luka pangkas pada batang akan mengering aman tanpa risiko infeksi jamur.`;
      } else if (status === 'WARN') {
        return `${greeting} Pak. Untuk pemangkasan tanaman hari ini harap waspada. ${fieldNote}. Waktu yang dianjurkan antara jam ${cleanWindow}. Pastikan alat pangkas bersih dan lakukan dengan hati-hati.`;
      } else {
        return `Perhatian Pak. Hindari pemangkasan tanaman hari ini. ${fieldNote}. Luka batang yang terkena basah hujan sangat rentan dimasuki spora jamur dan bakteri pembusuk.`;
      }
    }
  }
}

// --- Voice Summary Generator (Overall) ---

function generateVoiceSummary(actions: Record<ActionType, ActionEvaluation>): string {
  const parts: string[] = [];
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 11 ? 'Selamat pagi' : hour < 15 ? 'Selamat siang' : 'Selamat sore';

  parts.push(`${greeting} Pak.`);

  const safe = Object.entries(actions).filter(([, a]) => a.status === 'SAFE');
  const danger = Object.entries(actions).filter(([, a]) => a.status === 'DANGER');

  if (safe.length > 0) {
    const safeNames = safe.map(([key]) => ACTION_META[key as ActionType].label.toLowerCase());
    const bestAction = safe[0];
    parts.push(
      `Hari ini kondisi aman untuk ${safeNames.join(', ')}` +
      (bestAction[1].bestWindow !== 'Belum ada waktu aman'
        ? ` antara ${bestAction[1].bestWindow.replace(' WIB', '')}.`
        : '.')
    );
  }

  if (danger.length > 0) {
    const dangerNames = danger.map(([key]) => ACTION_META[key as ActionType].label.toLowerCase());
    parts.push(`Namun, tunda ${dangerNames.join(' dan ')} karena ${danger[0][1].fieldNote.toLowerCase()}.`);
  }

  if (safe.length === 0 && danger.length === 0) {
    parts.push('Kondisi cuaca hari ini bervariasi. Perhatikan jadwal per jam untuk setiap aktivitas.');
  }

  return parts.join(' ');
}

// --- Main Export ---

export function evaluateAllActions(weatherData: WeatherData): AgroAdvisory {
  const allHourly = weatherData.hourly ?? [];

  // Get today's date string in local time
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Filter for today 06:00–18:00
  let daytimeHourly = allHourly.filter((h) => {
    const dt = new Date(h.time);
    const hour = dt.getHours();
    const dateStr = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    return dateStr === todayStr && hour >= 6 && hour <= 18;
  });

  // Fallback if today's data is empty (e.g. late at night)
  if (daytimeHourly.length === 0) {
    daytimeHourly = allHourly.filter((h) => {
      const hour = new Date(h.time).getHours();
      return hour >= 6 && hour <= 18;
    }).slice(0, 13);
  }

  const actionTypes: ActionType[] = ['irrigation', 'fertilizing', 'spraying', 'harvesting', 'pruning'];
  const evaluations = {} as Record<ActionType, ActionEvaluation>;

  for (const action of actionTypes) {
    const timeline: HourlyStatus[] = daytimeHourly.map((hourData) => {
      const origIndex = allHourly.findIndex((h) => h.time === hourData.time);
      const evalIndex = origIndex >= 0 ? origIndex : 0;

      let result: { status: StatusLevel; reason: string };
      switch (action) {
        case 'spraying': result = evaluateSpraying(hourData, evalIndex, allHourly); break;
        case 'fertilizing': result = evaluateFertilizing(hourData, evalIndex, allHourly); break;
        case 'irrigation': result = evaluateIrrigation(hourData, evalIndex, allHourly); break;
        case 'harvesting': result = evaluateHarvesting(hourData, evalIndex, allHourly); break;
        case 'pruning': result = evaluatePruning(hourData, evalIndex, allHourly); break;
      }

      return {
        hour: formatHour(hourData.time),
        status: result.status,
        reason: result.reason,
      };
    });

    // Determine overall status from golden hours (06–10)
    const goldenHours = timeline.filter((t) => {
      const h = parseInt(t.hour);
      return h >= 6 && h <= 10;
    });

    let overallStatus: StatusLevel = 'WARN';
    if (goldenHours.some((t) => t.status === 'SAFE')) {
      overallStatus = 'SAFE';
    } else if (goldenHours.length > 0 && goldenHours.every((t) => t.status === 'DANGER')) {
      overallStatus = 'DANGER';
    } else if (timeline.some((t) => t.status === 'SAFE')) {
      overallStatus = 'SAFE';
    } else if (timeline.every((t) => t.status === 'DANGER')) {
      overallStatus = 'DANGER';
    }

    const bestWindow = findBestWindow(action, timeline);
    const fieldNote = generateFieldNote(action, overallStatus, timeline);
    const voiceInstruction = generateActionVoiceInstruction(
      action,
      overallStatus,
      bestWindow,
      fieldNote,
      timeline
    );

    evaluations[action] = {
      action,
      status: overallStatus,
      statusLabel: getStatusLabel(overallStatus),
      bestWindow,
      fieldNote,
      voiceInstruction,
      hourlyTimeline: timeline,
    };
  }

  return {
    location: {
      latitude: 0,
      longitude: 0,
      displayName: '',
    },
    commodity: '',
    generatedAt: new Date().toISOString(),
    voiceSummary: generateVoiceSummary(evaluations),
    actions: evaluations,
  };
}
