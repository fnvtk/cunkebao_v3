<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
    <style type="text/css">
        html, body {
            border: 0;
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
        }
        #main {
            width: 100%;
            height: 100%;
        }
    </style>
</head>
<body>
<div id="main"></div>
</body>
<script type="text/javascript" src="/static/echarts/echarts.min.js"></script>
<script type="text/javascript">
    var chartDom = document.getElementById('main');
    var myChart = echarts.init(chartDom);
    var option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            data: <?php echo json_encode($legend); ?>
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        toolbox: {
            feature: {
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: <?php echo json_encode($xAxis); ?>
        },
        yAxis: {
            type: 'value'
        },
        series: <?php echo json_encode($series); ?>
    };

    option && myChart.setOption(option);
</script>
</html>
