<template>
    <div class="donut-size">
        <div :class="[donut ? 'donut-graph' : 'pie-graph', 'pie-wrapper']">
            <span class="label">
                <span>{{ percent }}</span><span class="smaller">%</span>
            </span>
            <div class="pie" :style="{clip: pie}">
                <div class="left-side half-circle" :style="{'transform': leftside}"></div>
                <div class="right-side half-circle" :style="{'transform': rightside}"></div>
            </div>
            <div class="shadow"></div>
        </div>
    </div>
</template>

<script>
module.exports = {
    props: {
        donut: {
            type: Boolean,
            required: false,
            default: true
        },
        'percent': {
            type: Number,
            required: false,
            default: 0
        }
    },
    watch: {
        percent: function () {
            var forWholeNumber = Math.round(this.percent);
            var restrictUpperLimit = Math.min(forWholeNumber, 100);
            var restrictLowerLimit = Math.max(restrictUpperLimit, 0);
            this.percent = restrictLowerLimit;
        }
    },
    computed: {
        'pie': function () {
            var pie = 'rect(0, 1em, 1em, 0.5em)';
            if (Math.round(this.percent) > 50) {
                pie = 'rect(auto, auto, auto, auto)';
            }
            return pie;
        },
        'leftside': function () {
            var degrees = Math.round(360 * (this.percent / 100));
            var rotation = 'rotate(' + degrees + 'deg)';
            return rotation;
        },
        'rightside': function () {
            var rotation = 'rotate(0deg)';
            if (Math.round(this.percent) > 50) {
                rotation = 'rotate(180deg)';
            }
            return rotation;
        }
    }
};
</script>
