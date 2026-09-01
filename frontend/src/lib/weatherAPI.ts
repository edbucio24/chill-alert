export interface LiveWeather {
    currenttemp: number
    condition: string
    preicpation:number
    windmph: number
    todaylow:number
    todayshigh:number
    forecast:{day:string;condition:string,low:number,high:number}[]
}

const weather = [
    {codes:[0],label: 'Sunny'},
    {codes:[1,2],label:'Partly Cloudy'},
    {codes:[3],label:'Cloudy'},
    {codes:[45,48],label:'Foggy'},
    {codes: [51, 53, 55, 61, 63, 65, 80, 81, 82], label: 'Rainy' },
    {codes: [71, 73, 75, 85, 86], label: 'Snowy' },
    {codes: [95, 96, 99], label: 'Stormy' },
];

function codeToCondition(code:number):string{
    const match = weather.find(rule=>rule.codes.includes(code));
    return match ? match.label : 'Sunny';
}

export async function fetchLiveWeather(latitude:number,longitude:number):Promise<LiveWeather>{
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=4`

    const res = await fetch(weatherUrl)
    if(!res.ok){
        throw new Error('Weather API Error')
    }
    const json = await res.json()

    const days = ['Sun','Mon','Tues','Wed','Thurs','Fri','Sat']
    const forecast = json.daily.time.slice(1,4).map((dateStr:string,i:number)=>{
        const date = new Date(dateStr)
        return{
            day:days[date.getDay()],
            condition:codeToCondition(json.daily.weather_code[i+1]),
            low:Math.round(json.daily.temperature_2m_min[i+1]),
            high:Math.round(json.daily.temperature_2m_max[i+1]),
        }
    })
    return{
    currenttemp: Math.round(json.current.temperature_2m),
    condition: codeToCondition(json.current.weather_code),
    preicpation: json.current.precipitation,
    windmph: Math.round(json.current.wind_speed_10m),
    todaylow: Math.round(json.daily.temperature_2m_min[0]),
    todayshigh: Math.round(json.daily.temperature_2m_max[0]),
    forecast,
    }
}