const http = require("http")
const crypto = require("crypto")
const { spawn } = require("child_process")
const WEBHOOK_SECRET = "jdaug@*NLDAKJ@ldja)nea!l.apda!Q"
const deploy_script_path = "/home/yanghao/chart/deploy.sh"
var server = http.createServer(function (request, response) {
	// 回调函数接收request和response对象,
	// 获得HTTP请求的method和url:

	if (request.url === "/chart/autodeploy" && request.method === "POST") {
		let body = []
		request
			.on("data", chunk => {
				body.push(chunk)
			})
			.on("end", () => {
				body = Buffer.concat(body).toString()
				const signature = crypto.createHmac("sha256", WEBHOOK_SECRET).update(body).digest("hex")
				if (request.headers["x-hub-signature-256"] === `sha256=${signature}`) {
					let cmd = spawn("sh", [deploy_script_path])
					cmd.on("data", data => {
						console.log(`sh: ${data}`)
					})
					// github的webhook只有10s的timeout时间，所以这里直接返回结果，不等脚本跑完
					response.writeHead(200)
					response.end("success")
				} else {
					response.writeHead(401)
					response.end("Unauthorized")
				}
			})
	} else {
		response.writeHead(404)
		response.end("Not Found")
	}
	// 将HTTP响应200写入response, 同时设置Content-Type: text/html:
	// 将HTTP响应的HTML内容写入response:
})

server.listen(1998)
