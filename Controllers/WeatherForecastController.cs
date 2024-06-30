using Microsoft.AspNetCore.Mvc;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using System.Text;

namespace ImagesToVoxel.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class WeatherForecastController : ControllerBase
  {
    [HttpPost("processtovoxel")]
    public ActionResult<List<int[]>> ProcessToVoxel([FromBody] ImageData imageData)
    {
      if (string.IsNullOrEmpty(imageData.FrontData) || string.IsNullOrEmpty(imageData.SideData) || string.IsNullOrEmpty(imageData.TopData))
        return BadRequest("All image data must be provided.");
      var processor = new PixelsToVoxel();
      var voxelData = processor.Voxel(imageData.FrontData, imageData.SideData, imageData.TopData, imageData.Width);
      return Ok(voxelData);
    }

    [HttpPost("pixelize")]
    public ActionResult<string> PixelizeImage([FromForm] IFormFile imageFile, [FromForm] int pixelSize = 20)
    {
      if (imageFile == null || imageFile.Length == 0)
        return BadRequest("Image file is required.");
      using var memoryStream = new MemoryStream();
      imageFile.CopyTo(memoryStream);
      memoryStream.Position = 0;
      using var image = Image.Load<Rgba32>(memoryStream);
      image.Mutate(x => x.Resize(pixelSize, pixelSize).Grayscale().BinaryThreshold(0.5f));
      var binaryData = new StringBuilder(image.Height * image.Width);
      for (int y = 0; y < image.Height; y++) {
        for (int x = 0; x < image.Width; x++) {
          binaryData.Append(image[x, y].R == 255 ? '1' : '0');
        }
      }
      return Ok(binaryData.ToString());
    }
  }

  public class ImageData
  {
    public string FrontData { get; set; } = string.Empty;
    public string SideData { get; set; } = string.Empty;
    public string TopData { get; set; } = string.Empty;
    public int Width { get; set; }
  }

  public class PixelsToVoxel
  {
    public List<int[]> Voxel(string frontData, string sideData, string topData, int width)
    {
      var voxelData = new List<int[]>();
      for (int y = 0; y < width; y++) {
        for (int x = 0; x < width; x++) {
          for (int z = 0; z < width; z++) {
            int frontIndex = y * width + x;
            int sideIndex = y * width + z;
            int topIndex = x * width + z;
            if (frontData[frontIndex] == '0' && sideData[sideIndex] == '0' && topData[topIndex] == '0') {
              voxelData.Add(new int[] { x, y, z });
            }
          }
        }
      }
      return voxelData;
    }
  }
}
