import './styles.scss'
import {getChartData} from "./data";
import {Chart} from "./chart";

const canvas = document.getElementById('chart')
const tgChart = new Chart(canvas, getChartData())
tgChart.init()
console.log(tgChart)
