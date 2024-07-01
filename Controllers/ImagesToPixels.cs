using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using System.Text;

namespace ImagesToVoxel.Controllers {
  public class ImagesToPixels {
    public string Pixel(string base64String, int size) {
      var imageBytes = Convert.FromBase64String(base64String);
      using var image = Image.Load<Rgba32>(imageBytes);

      image.Mutate(x => x.Resize(size, size).Grayscale().BinaryThreshold(0.5f));

      var binaryData = new StringBuilder(image.Height * image.Width);
      for (int y = 0; y < image.Height; y++) {
        for (int x = 0; x < image.Width; x++) {
          binaryData.Append(image[x, y].R == 255 ? '1' : '0');
        }
      }

      return binaryData.ToString();
    }
  }
}
