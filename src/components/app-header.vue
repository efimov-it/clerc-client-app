<template>
  <header class="header">
    <h1 class="logo">
        CLERC
    </h1>
    <div class="header-wrapper">
        <slot></slot>
    </div>
  </header>
</template>

<script>
export default {}
</script>

<style lang="scss">
.header{
  min-height: 62px;
  background-color: #ffffff;
  border-bottom: 1px solid #DCDCE8;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;

  .logo{
    padding: 0 60px;
    color: #5361FF;
    font-size: 38px;
    font-weight: bold;
    cursor: default;
    user-select: none;
  }
}
</style>
