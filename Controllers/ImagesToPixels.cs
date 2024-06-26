using SixLabors.ImageSharp;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using System.Text;

namespace ImagesToVoxel.Controllers {
  public class ImagesToPixels {
    public string Pixel(string imagePath, float rotationDegrees = 0, bool flipY = false) {
      using var image = Image.Load<Rgba32>(imagePath);

      if (rotationDegrees != 0) image.Mutate(x => x.Rotate(rotationDegrees));
      if (flipY) image.Mutate(y => y.Flip(FlipMode.Horizontal));

      image.Mutate(x => x.Resize(20, 20).Grayscale().BinaryThreshold(0.5f));

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
