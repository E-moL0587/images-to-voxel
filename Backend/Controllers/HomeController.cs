using Microsoft.AspNetCore.Mvc;

namespace Frontend.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomeController : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> ProcessImage([FromForm] IFormFile image)
        {
            if (image == null || image.Length == 0)
            {
                return BadRequest("No image uploaded");
            }

            using (var memoryStream = new MemoryStream())
            {
                await image.CopyToAsync(memoryStream);
                var imageBytes = memoryStream.ToArray();

                // 画像の処理（例：ここで任意の画像処理を行う）
                // 処理後の画像データをimageBytesに格納

                return File(imageBytes, "image/jpeg"); // 必要に応じてMIMEタイプを変更
            }
        }
    }
}
