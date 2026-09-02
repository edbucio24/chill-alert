import { useState, useEffect } from "react";
import{
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ReferenceLine,
    ResponsiveContainer
} from 'recharts'
import { fetchHourlyData } from "../lib/weatherAPI";
import { HourlyPoint } from "../lib/weatherAPI";
import { Measurement } from "../types";

interface Props{
    lattidue: number
    longitude:number
    measurement:Measurement
}

const FROST = 32
