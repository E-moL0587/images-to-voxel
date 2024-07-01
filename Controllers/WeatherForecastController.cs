using Microsoft.AspNetCore.Mvc;

namespace ImagesToVoxel.Controllers {

  [ApiController]
  [Route("[controller]")]
  public class WeatherForecastController : ControllerBase {

    [HttpPost("upload")]
    public ActionResult Upload([FromBody] Base64StringRequest request) {
      if (string.IsNullOrEmpty(request.Base64String)) {
        return BadRequest("Invalid image data");
      }

      try {
        var imageProcessor = new ImagesToPixels();
        var binaryData = imageProcessor.Pixel(request.Base64String);
        return Ok(new { binaryData });
      } catch (Exception ex) {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpPost("convert")]
    public ActionResult Convert([FromBody] VoxelRequest request) {
      if (string.IsNullOrEmpty(request.FrontData) ||
          string.IsNullOrEmpty(request.SideData) ||
          string.IsNullOrEmpty(request.TopData) ||
          request.Width <= 0) {
        return BadRequest("Invalid voxel conversion data");
      }

      try {
        var voxelProcessor = new PixelsToVoxel();
        var voxelData = voxelProcessor.Voxel(request.FrontData, request.SideData, request.TopData, request.Width);
        return Ok(new { voxelData });
      } catch (Exception ex) {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    public class Base64StringRequest {
      public string? Base64String { get; set; }
    }

    public class VoxelRequest {
      public string? FrontData { get; set; }
      public string? SideData { get; set; }
      public string? TopData { get; set; }
      public int Width { get; set; }
    }
  }
}
