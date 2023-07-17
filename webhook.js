const http = require("http")
const crypto = require("crypto")
const WEBHOOK_SECRET = "jdaug@*NLDAKJ@ldja)nea!l.apda!Q"
var server = http.createServer(function (request, response) {
	// 回调函数接收request和response对象,
	// 获得HTTP请求的method和url:

	if (request.url === "/chart/autodeploy" && request.method === "POST") {
        console.log(new Date());
		let body = []
		request
			.on("data", chunk => {
				body.push(chunk)
			})
			.on("end", () => {
				body = Buffer.concat(body).toString()
				// at this point, `body` has the entire request body stored in it as a string
                console.log(body);
				const signature = crypto.createHmac("sha256", WEBHOOK_SECRET).update(JSON.stringify(body)).digest("hex")
				if (request.headers["x-hub-signature-256"] === `sha256=${signature}`) {
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
