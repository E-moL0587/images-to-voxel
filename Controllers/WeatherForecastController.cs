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

      var imageProcessor = new ImagesToPixels();
      var binaryData = imageProcessor.Pixel(request.Base64String, request.Size);
      return Ok(new { binaryData });
    }

    [HttpPost("voxel")]
    public ActionResult Voxel([FromBody] VoxelRequest request) {
      if (string.IsNullOrEmpty(request.FrontData) || string.IsNullOrEmpty(request.SideData) || string.IsNullOrEmpty(request.TopData) || request.Size <= 0) {
        return BadRequest("Invalid voxel data or size");
      }

      var voxelProcessor = new PixelsToVoxel();
      var voxelData = voxelProcessor.Voxel(request.FrontData, request.SideData, request.TopData, request.Size);

      var meshProcessor = new MarchingCubes();
      var meshData = meshProcessor.Mesh(voxelData, request.Size, request.Size, request.Size);

      var smoothProcessor = new LaplacianSmoothing(request.Iterations, request.Lambda);
      var smoothData = smoothProcessor.Smooth(meshData);

      return Ok(new { voxelData, meshData, smoothData });
    }

    public class ImageUploadRequest {
      public string? Base64String { get; set; }
      public int Size { get; set; }
    }

    public class VoxelRequest {
      public string? FrontData { get; set; }
      public string? SideData { get; set; }
      public string? TopData { get; set; }
      public int Size { get; set; }
      public int Iterations { get; set; }
      public float Lambda { get; set; }
    }
  }
}
