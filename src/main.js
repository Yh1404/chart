import { createApp } from "vue"
import App from "./App.vue"
import { Modal, Drawer, Button, Slider, Checkbox, Radio, Form, Input, Upload, Popover, Space } from "ant-design-vue"
import "ant-design-vue/dist/antd.css"
import "@/assets/styles/main.scss"

const app = createApp(App)

app.use(Modal)
app.use(Drawer)
app.use(Button)
app.use(Slider)
app.use(Checkbox)
app.use(Radio)
app.use(Form)
app.use(Input)
app.use(Upload)
app.use(Popover)
app.use(Space)

app.directive("focus", {
	mounted: el => el.focus(),
})

app.mount("#app")
