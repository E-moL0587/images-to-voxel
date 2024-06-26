using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ImagesToVoxel.Controllers {
  public class HomeController : Controller {
    private readonly string _startImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/");
    private readonly string _frontImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/temp/front.png");
    private readonly string _sideImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/temp/side.png");
    private readonly string _topImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/temp/top.png");
    private readonly ImagesToPixels _imagesToPixels;
    private readonly PixelsToVoxel _pixelsToVoxel;
    private readonly MarchingCubes _marchingCubes;
    private readonly LaplacianSmoothing _laplacianSmoothing;

    public HomeController() {
      _imagesToPixels = new ImagesToPixels();
      _pixelsToVoxel = new PixelsToVoxel();
      _marchingCubes = new MarchingCubes();
      _laplacianSmoothing = new LaplacianSmoothing();

      InitializeImages();
    }

    private void InitializeImages() {
      if (!System.IO.File.Exists(_frontImagePath)) {
        System.IO.File.Copy(Path.Combine(_startImagePath, "front.png"), _frontImagePath);
      }
      if (!System.IO.File.Exists(_sideImagePath)) {
        System.IO.File.Copy(Path.Combine(_startImagePath, "side.png"), _sideImagePath);
      }
      if (!System.IO.File.Exists(_topImagePath)) {
        System.IO.File.Copy(Path.Combine(_startImagePath, "top.png"), _topImagePath);
      }
    }

    public IActionResult Index() {
      var (voxelData, frontBinaryData, sideBinaryData, topBinaryData) = PrepareVoxel();
      var meshData = _marchingCubes.Mesh(voxelData, 20, 20, 20);
      var smoothData = _laplacianSmoothing.Smooth(meshData);

      ViewData["VoxelData"] = JsonSerializer.Serialize(voxelData);
      ViewData["MeshData"] = JsonSerializer.Serialize(meshData);
      ViewData["SmoothData"] = JsonSerializer.Serialize(smoothData);

      ViewData["FrontBinaryData"] = frontBinaryData;
      ViewData["SideBinaryData"] = sideBinaryData;
      ViewData["TopBinaryData"] = topBinaryData;

      return View();
    }

    [HttpPost]
    public IActionResult Upload(IFormFile frontImage, IFormFile sideImage, IFormFile topImage) {
      if (frontImage != null) {
        using (var stream = new MemoryStream()) {
          frontImage.CopyTo(stream);
          System.IO.File.WriteAllBytes(_frontImagePath, stream.ToArray());
        }
      }

      if (sideImage != null) {
        using (var stream = new MemoryStream()) {
          sideImage.CopyTo(stream);
          System.IO.File.WriteAllBytes(_sideImagePath, stream.ToArray());
        }
      }

      if (topImage != null) {
        using (var stream = new MemoryStream()) {
          topImage.CopyTo(stream);
          System.IO.File.WriteAllBytes(_topImagePath, stream.ToArray());
        }
      }

      return RedirectToAction("Index");
    }

    private (List<int[]> voxelData, string frontBinaryData, string sideBinaryData, string topBinaryData) PrepareVoxel() {
      var frontBinaryData = _imagesToPixels.Pixel(_frontImagePath, flipY: true);
      var sideBinaryData = _imagesToPixels.Pixel(_sideImagePath);
      var topBinaryData = _imagesToPixels.Pixel(_topImagePath, flipY: true);
      var rotatedTopBinaryData = _imagesToPixels.Pixel(_topImagePath, 90);

      var voxelData = _pixelsToVoxel.Voxel(frontBinaryData, sideBinaryData, rotatedTopBinaryData, 20);

      return (voxelData, frontBinaryData, sideBinaryData, topBinaryData);
    }
  }
}
