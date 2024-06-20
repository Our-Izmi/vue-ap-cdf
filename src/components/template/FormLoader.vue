<template>
    <div :class="'loader-container ' + (active ? 'active' : '')">
        <div tabindex="0" class="vld-overlay is-active is-full-page" aria-busy="true" aria-label="Loading"
            style="z-index: 100;">
            <div class="vld-background" style="backdrop-filter: blur(2px);"></div>
            <div class="vld-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" height="40" width="40" fill="#000">
                    <rect x="0" y="13" width="4" height="5">
                        <animate attributeName="height" attributeType="XML" values="5;21;5" begin="0s" dur="0.6s"
                            repeatCount="indefinite"></animate>
                        <animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0s" dur="0.6s"
                            repeatCount="indefinite"></animate>
                    </rect>
                    <rect x="10" y="13" width="4" height="5">
                        <animate attributeName="height" attributeType="XML" values="5;21;5" begin="0.15s" dur="0.6s"
                            repeatCount="indefinite"></animate>
                        <animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0.15s" dur="0.6s"
                            repeatCount="indefinite"></animate>
                    </rect>
                    <rect x="20" y="13" width="4" height="5">
                        <animate attributeName="height" attributeType="XML" values="5;21;5" begin="0.3s" dur="0.6s"
                            repeatCount="indefinite"></animate>
                        <animate attributeName="y" attributeType="XML" values="13; 5; 13" begin="0.3s" dur="0.6s"
                            repeatCount="indefinite"></animate>
                    </rect>
                </svg>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        active: {
            type: Boolean,
            default: false
        }
    }
}
</script>

<style scoped>
.loader-container {
    display: none;
    align-items: center;
    align-content: center;
    justify-items: center;
    z-index: 99999;
    position: fixed;
    left: 0px;
    top: 0px;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.208);
}

.loader-container.active {
    display: flex;
}

.loader-container div {
    margin: 0 auto;
}
</style>