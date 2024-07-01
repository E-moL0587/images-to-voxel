using Microsoft.AspNetCore.Mvc;

namespace ImagesToVoxel.Controllers {

  [ApiController]
  [Route("[controller]")]
  public class WeatherForecastController : ControllerBase {

    [HttpPost("upload")]
    public ActionResult Upload([FromBody] ImageUploadRequest request) {
      if (string.IsNullOrEmpty(request.Base64String) || request.Size <= 0) { return BadRequest("Invalid image data or size"); }

      try {
        var imageProcessor = new ImagesToPixels();
        var binaryData = imageProcessor.Pixel(request.Base64String, request.Size);
        return Ok(new { binaryData });
      } catch (Exception ex) { return StatusCode(500, $"Internal server error: {ex.Message}"); }
    }

    public class ImageUploadRequest { public string? Base64String { get; set; } public int Size { get; set; } }
  }
}
