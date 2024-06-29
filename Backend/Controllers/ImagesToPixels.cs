using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using System.Text;

namespace Frontend.Api.Controllers {
  public class ImagesToPixels {
    public string Pixel(string imagePath, int pixelSize = 20) {
      using var image = Image.Load<Rgba32>(imagePath);

      image.Mutate(x => x.Resize(pixelSize, pixelSize).Grayscale().BinaryThreshold(0.5f));

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
