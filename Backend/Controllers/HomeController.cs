using Microsoft.AspNetCore.Mvc;

namespace Frontend.Api.Controllers {
  [ApiController]
  [Route("api/[controller]")]
  public class HomeController : ControllerBase {
    private readonly ImagesToPixels _imagesToPixels;
    public HomeController() { _imagesToPixels = new ImagesToPixels(); }

    [HttpPost]
    public async Task<IActionResult> ProcessImage([FromForm] IFormFile image) {
      if (image == null || image.Length == 0) {
        return BadRequest("No image uploaded");
      }

      string binaryData;
      using (var memoryStream = new MemoryStream()) {
        await image.CopyToAsync(memoryStream);
        memoryStream.Seek(0, SeekOrigin.Begin);

        var tempFilePath = Path.GetTempFileName();
        await using (var tempFileStream = System.IO.File.Create(tempFilePath)) {
          memoryStream.Seek(0, SeekOrigin.Begin);
          await memoryStream.CopyToAsync(tempFileStream);
        }

        binaryData = _imagesToPixels.Pixel(tempFilePath);
        System.IO.File.Delete(tempFilePath);
      }

      return Ok(binaryData);
    }
  }
}
