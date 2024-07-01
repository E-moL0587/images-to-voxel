using Microsoft.AspNetCore.Mvc;

namespace ImagesToVoxel.Controllers {

  [ApiController]
  [Route("[controller]")]
  public class WeatherForecastController : ControllerBase {

    [HttpPost("upload")]
    public ActionResult Upload([FromBody] ImageUploadRequest request) {
      if (string.IsNullOrEmpty(request.Base64String) || request.Size <= 0) {
        return BadRequest("Invalid image data or size");
      }

      try {
        var imageProcessor = new ImagesToPixels();
        var binaryData = imageProcessor.Pixel(request.Base64String, request.Size);
        return Ok(new { binaryData });
      } catch (Exception ex) {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    [HttpPost("voxel")]
    public ActionResult Voxel([FromBody] VoxelRequest request) {
      if (string.IsNullOrEmpty(request.FrontData) || string.IsNullOrEmpty(request.SideData) || string.IsNullOrEmpty(request.TopData) || request.Width <= 0) {
        return BadRequest("Invalid voxel data or width");
      }

      try {
        var voxelProcessor = new PixelsToVoxel();
        var voxelData = voxelProcessor.Voxel(request.FrontData, request.SideData, request.TopData, request.Width);
        return Ok(new { voxelData });
      } catch (Exception ex) {
        return StatusCode(500, $"Internal server error: {ex.Message}");
      }
    }

    public class ImageUploadRequest {
      public string? Base64String { get; set; }
      public int Size { get; set; }
    }

    public class VoxelRequest {
      public string? FrontData { get; set; }
      public string? SideData { get; set; }
      public string? TopData { get; set; }
      public int Width { get; set; }
    }
  }
}
