<template>
  <view class="line-chart">
    <view class="chart-container">
      <view class="y-axis">
        <view class="axis-label" v-for="(value, index) in yAxisLabels" :key="'y-'+index">
          {{ value }}
        </view>
      </view>
      
      <view class="chart-body">
        <view class="grid-lines">
          <view class="grid-line" v-for="(value, index) in yAxisLabels" :key="'grid-'+index"></view>
        </view>
        
        <view class="line-container">
          <view class="line-path">
            <view class="line-segment" 
              v-for="(point, index) in normalizedPoints" 
              :key="'line-'+index"
              v-if="index < normalizedPoints.length - 1"
              :style="{
                left: `${index * 100 / (points.length - 1)}%`,
                width: `${100 / (points.length - 1)}%`,
                bottom: `${point * 100}%`,
                height: `${(normalizedPoints[index + 1] - point) * 100}%`,
                transform: `skewX(${(normalizedPoints[index + 1] - point) > 0 ? 45 : -45}deg)`,
                transformOrigin: 'bottom left'
              }"
            ></view>
          </view>
          
          <view class="data-points">
            <view class="data-point" 
              v-for="(point, index) in normalizedPoints" 
              :key="'point-'+index"
              :style="{
                left: `${index * 100 / (points.length - 1)}%`,
                bottom: `${point * 100}%`
              }"
            >
              <view class="point-inner"></view>
            </view>
          </view>
        </view>
      </view>
      
      <view class="x-axis">
        <view class="axis-label" 
          v-for="(label, index) in xAxisLabels" 
          :key="'x-'+index"
          :style="{ left: `${index * 100 / (xAxisLabels.length - 1)}%` }"
        >
          {{ label }}
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LineChart',
  props: {
    points: {
      type: Array,
      required: true
    },
    xAxisLabels: {
      type: Array,
      default: () => []
    },
    color: {
      type: String,
      default: '#4080ff'
    },
    yAxisCount: {
      type: Number,
      default: 6
    }
  },
  computed: {
    // 计算最大最小值
    max() {
      return Math.max(...this.points, 0);
    },
    min() {
      return Math.min(...this.points, 0);
    },
    // 归一化数据点（转换为0-1之间的值）
    normalizedPoints() {
      const range = this.max - this.min;
      if (range === 0) return this.points.map(() => 0.5);
      return this.points.map(point => (point - this.min) / range);
    },
    // 计算Y轴标签
    yAxisLabels() {
      const labels = [];
      const range = this.max - this.min;
      const step = range / (this.yAxisCount - 1);
      
      for (let i = 0; i < this.yAxisCount; i++) {
        const value = Math.round(this.min + (step * i));
        labels.unshift(value);
      }
      
      return labels;
    }
  }
}
</script>

<style lang="scss" scoped>
.line-chart {
  width: 100%;
  height: 100%;
  padding: 20rpx;
  
  .chart-container {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  
  .y-axis {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 40rpx;
    width: 60rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    .axis-label {
      font-size: 22rpx;
      color: #777;
      text-align: right;
      padding-right: 10rpx;
    }
  }
  
  .chart-body {
    flex: 1;
    margin-left: 60rpx;
    margin-bottom: 40rpx;
    position: relative;
    border-left: 1px solid #eeeeee;
    border-bottom: 1px solid #eeeeee;
    
    .grid-lines {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      
      .grid-line {
        position: absolute;
        left: 0;
        right: 0;
        border-top: 1px dashed #eeeeee;
        
        &:nth-child(1) {
          bottom: 0;
        }
        
        &:nth-child(2) {
          bottom: 25%;
        }
        
        &:nth-child(3) {
          bottom: 50%;
        }
        
        &:nth-child(4) {
          bottom: 75%;
        }
        
        &:nth-child(5) {
          bottom: 100%;
        }
      }
    }
    
    .line-container {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      
      .line-path {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        
        .line-segment {
          position: absolute;
          background-color: v-bind(color);
          height: 4rpx;
        }
      }
      
      .data-points {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        
        .data-point {
          position: absolute;
          transform: translate(-50%, 50%);
          width: 16rpx;
          height: 16rpx;
          border-radius: 50%;
          background-color: #fff;
          border: 4rpx solid v-bind(color);
          
          .point-inner {
            position: absolute;
            left: 2rpx;
            top: 2rpx;
            right: 2rpx;
            bottom: 2rpx;
            border-radius: 50%;
            background-color: v-bind(color);
          }
        }
      }
    }
  }
  
  .x-axis {
    height: 40rpx;
    margin-left: 60rpx;
    position: relative;
    
    .axis-label {
      position: absolute;
      transform: translateX(-50%);
      font-size: 22rpx;
      color: #777;
      text-align: center;
      top: 10rpx;
    }
  }
}
</style> 