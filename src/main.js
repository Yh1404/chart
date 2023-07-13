import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import Antd from "ant-design-vue"
import "ant-design-vue/dist/antd.css"
import "@/assets/styles/main.scss"

const app = createApp(App)

app.use(Antd)
app.directive("focus", {
	mounted: el => el.focus(),
})

app.mount("#app")
