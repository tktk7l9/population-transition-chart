import React, { Component } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import apiKey from './apiKey';

class App extends Component {
  constructor() {
    super();
    this.state = {
      selected: Array(47).fill(false),
      prefectures: {},
      series: []
    };
    this._changeSelection = this._changeSelection.bind(this);
  }

  componentDidMount() {
    fetch('https://opendata.resas-portal.go.jp/api/v1/prefectures', {
      headers: { 'X-API-KEY': apiKey }
    })
      .then(response => response.json())
      .then(res => {
        this.setState({ prefectures: res.result });
      });
  }

  _changeSelection(index) {
    const selected_copy = this.state.selected.slice();
    selected_copy[index] = !selected_copy[index];

    if (!this.state.selected[index]) {
      fetch(
        `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${index +
          1}`,
        {
          headers: { 'X-API-KEY': apiKey }
        }
      )
        .then(response => response.json())
        .then(res => {
          let tmp = [];
          console.log(res.result.data[0].label)
          Object.keys(res.result.data[0].data).forEach(i => {
            tmp.push(res.result.data[0].data[i].value);
          });
          const res_series = {
            name: this.state.prefectures[index].prefName,
            data: tmp
          };
          this.setState({
            selected: selected_copy,
            series: [...this.state.series, res_series]
          });
        });
    } else {
      const series_copy = this.state.series.slice();
      for (let i = 0; i < series_copy.length; i++) {
        if (series_copy[i].name == this.state.prefectures[index].prefName) {
          series_copy.splice(i, 1);
        }
      }
      this.setState({
        selected: selected_copy,
        series: series_copy
      });
    }
  }

  renderItem(props) {
    return (
      <div
        key={props.prefCode}
        style={{ margin: '5px', display: 'inline-block' }}
      >
        <input
          type="checkbox"
          checked={this.state.selected[props.prefCode - 1]}
          onChange={() => this._changeSelection(props.prefCode - 1)}
        />
        {props.prefName}
      </div>
    );
  }

  render() {
    const fromYear = 1980;
    const toYear = 2020;
    const intervalYear = 10;
    const yTitle = '人口数';
    const xTitle = '年度';
    const obj = this.state.prefectures;
    const options = {
      chart: {
        height: 400,
        width: 500
      },
      title: {
        text: ''
      },
      yAxis: {
        title: {
          text: yTitle
        },
      },
      xAxis: {
        title: {
          text: xTitle
        },
        max: toYear
      },
      legend: {
        align: "right"
      },
      plotOptions: {
        series: {
          label: {
            connectorAllowed: false
          },
          pointInterval: intervalYear,
          pointStart: fromYear
        }
      },
      series: this.state.series
    };
    return (
      <div>
        <h1>都道府県別の総人口推移グラフを表示するSPA</h1>
        <p>都道府県</p>
        {Object.keys(obj).map(i => this.renderItem(obj[i]))}
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    );
  }
}

export default App;