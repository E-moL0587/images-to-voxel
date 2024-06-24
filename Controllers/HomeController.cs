using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace ImagesToVoxel.Controllers {
  public class HomeController : Controller {
    private readonly string _frontImagePath;
    private readonly string _sideImagePath;
    private readonly string _topImagePath;
    private readonly ImagesToPixels _imagesToPixels;
    private readonly PixelsToVoxel _pixelsToVoxel;
    private readonly MarchingCubes _marchingCubes;
    private readonly LaplacianSmoothing _laplacianSmoothing;

    public HomeController() {
      _frontImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/front.png");
      _sideImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/side.png");
      _topImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/top.png");
      _imagesToPixels = new ImagesToPixels();
      _pixelsToVoxel = new PixelsToVoxel();
      _marchingCubes = new MarchingCubes();
      _laplacianSmoothing = new LaplacianSmoothing();
    }

    public IActionResult Index() {
      var frontBinaryData = _imagesToPixels.Pixel(_frontImagePath);
      var sideBinaryData = _imagesToPixels.Pixel(_sideImagePath);
      var topBinaryData = _imagesToPixels.Pixel(_topImagePath);

      ViewData["FrontBinaryData"] = frontBinaryData;
      ViewData["SideBinaryData"] = sideBinaryData;
      ViewData["TopBinaryData"] = topBinaryData;

      var (voxelData, _, _, _) = PrepareVoxel();
      var meshData = _marchingCubes.Mesh(voxelData, 20, 20, 20);
      var smoothData = _laplacianSmoothing.Smooth(meshData);

      ViewData["VoxelData"] = JsonSerializer.Serialize(voxelData);
      ViewData["MeshData"] = JsonSerializer.Serialize(meshData);
      ViewData["SmoothData"] = JsonSerializer.Serialize(smoothData);

      return View();
    }

    private (List<int[]> voxelData, string frontBinaryData, string sideBinaryData, string topBinaryData) PrepareVoxel() {
      var frontBinaryData = _imagesToPixels.Pixel(_frontImagePath);
      var sideBinaryData = _imagesToPixels.Pixel(_sideImagePath);
      var topBinaryData = _imagesToPixels.Pixel(_topImagePath, 90);
      var voxelData = _pixelsToVoxel.Voxel(frontBinaryData, sideBinaryData, topBinaryData, 20);

      return (voxelData, frontBinaryData, sideBinaryData, topBinaryData);
    }
  }
}
