import './styles.scss'
import {getChartData} from "./data";
import {Chart} from "./chart";

const root = document.getElementById('chart')
const tgChart = new Chart(root, getChartData())
tgChart.init()
