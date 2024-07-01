using Microsoft.AspNetCore.Mvc;

namespace ImagesToVoxel.Controllers {

  [ApiController]
  [Route("[controller]")]
  public class WeatherForecastController : ControllerBase {

    [HttpPost("upload")]
    public ActionResult Upload([FromBody] Base64StringRequest request) {
      if (string.IsNullOrEmpty(request.Base64String)) { return BadRequest("Invalid image data"); }

      try {
        var imageProcessor = new ImagesToPixels();
        var binaryData = imageProcessor.Pixel(request.Base64String);
        return Ok(new { binaryData });
      } catch (Exception ex) { return StatusCode(500, $"Internal server error: {ex.Message}"); }
    }

    public class Base64StringRequest { public string? Base64String { get; set; } }
  }
}
