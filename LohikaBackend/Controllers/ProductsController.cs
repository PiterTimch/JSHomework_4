﻿using AutoMapper;
using Data.LohikaBackend;
using Data.LohikaBackend.Entities;
using LohikaBackend.Abastract;
using LohikaBackend.Constants;
using LohikaBackend.Helpers;
using LohikaBackend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LohikaBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = Roles.Admin)]
    public class ProductsController : ControllerBase
    {
        private readonly AppEFContext _context;
        private readonly IMapper _mapper;
        private readonly IWebHostEnvironment _env;
        private readonly IConfiguration _configuration;
        private readonly IImageService _imageService;
        public ProductsController(AppEFContext context,
            IWebHostEnvironment env, IConfiguration configuration,
            IMapper mapper,
            IImageService imageService)
        {
            //Thread.Sleep(2000);
            _context = context;
            _env = env;
            _configuration = configuration;
            _mapper = mapper;
            _imageService = imageService;
        }
        [HttpPost]
        [Route("add")]
        public async Task<IActionResult> Add([FromBody] ProductAddViewModel model)
        {
            try
            {
                string fileName = String.Empty;
                var product = _mapper.Map<ProductEntity>(model);
                product.Image = "bad";
                //if (model.Image != null)
                //{
                //    string randomFilename = Path.GetRandomFileName() +
                //        ".jpeg";
                //    string pathSaveImages = InitStaticFiles
                //        .CreateImageByFileName(_env, _configuration,
                //            new string[] { "Folder" },
                //            randomFilename, model.Image, false, false);

                //    product.Image = randomFilename;
                //}
                
                _context.Products.Add(product);
                await _context.SaveChangesAsync();
                if (model.ids != null)
                {
                    foreach (var id in model.ids)
                    {
                        var image = _context.ProductImages.FirstOrDefault(x => x.Id == id);
                        image.ProductId = product.Id;
                        _context.SaveChanges();
                    }
                }
                return Ok(new { id = product.Id});
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    invalid = ex.Message
                });
            }
        }

        [HttpPost]
        [Route("upload")]
        public async Task<IActionResult> Upload([FromBody] ProductImageAddViewModel model)
        {
            try
            {
                var entity = new ProductImageEntity();

                if (model.Image != null)
                {
                    entity.Name = await _imageService.SaveImageAsync(model.Image);
                }

                _context.ProductImages.Add(entity);
                await _context.SaveChangesAsync();
                var result = new ProductImageItemViewModel
                {
                    Id = entity.Id,
                    Name = entity.Name
                };
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    invalid = ex.Message
                });
            }
        }

        [HttpGet]
        [Route("list")]
        public async Task<IActionResult> List()
        {
            try
            {
                var model = await _context.Products
                    .Include(c => c.Category)
                    .Include(p => p.ProductImages)
                    .Select(x => new ProductItemViewModel
                    {
                        Id = x.Id,
                        Name = x.Name,
                        CategoryName = x.Category.Title,
                        Price = x.Price,
                        Priority = x.Priority,
                        Images = x.ProductImages
                            .OrderBy(img => img.DateCreated)
                            .Select(img => img.Name)
                            .ToList()
                    })
                    .ToListAsync();

                return Ok(model);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    invalid = ex.Message
                });
            }
        }

        [HttpGet]
        [Route("search")]
        [AllowAnonymous]
        public async Task<IActionResult> Search([FromQuery] ProductSearchViewModel search)
        {
            try
            {
                string categoryName="";
                int page = search.Page;
                //Thread.Sleep(2000);
                int pageSize = 8;
                var query = _context.Products
                    .Include(c => c.Category)
                    .Include(x=>x.ProductImages)
                    .AsQueryable();
                if (!string.IsNullOrEmpty(search.Id))
                {
                    int id = int.Parse(search.Id);
                    query = query.Where(x => x.Id == id);
                }
                if (!string.IsNullOrEmpty(search.Name))
                {
                    query = query.Where(x => x.Name.ToLower().Contains(search.Name.ToLower()));
                }
                if (search.Price!=null)
                {
                    query = query.Where(x => x.Price == search.Price);
                }
                if (!string.IsNullOrEmpty(search.Priority))
                {
                    int priority = int.Parse(search.Priority);
                    query = query.Where(x => x.Priority == priority);
                }
                if (!string.IsNullOrEmpty(search.CategorySlug))
                {
                    var cat = _context.Categories.SingleOrDefault(x => x.UrlSlug == search.CategorySlug);
                    if (cat != null)
                    {
                        categoryName = cat.Title;
                        query = query.Where(x => x.Category.UrlSlug == search.CategorySlug);
                    }
                }
                var model = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(x => _mapper.Map<ProductItemViewModel>(x))
                    .ToListAsync();
                int total = query.Count();
                int pages = (int)Math.Ceiling(total / (double)pageSize);
                return Ok(new ProductSearchResultViewModel
                {
                    Products = model,
                    Total = total,
                    CurrentPage=page,
                    Pages = pages,
                    CategoryName = categoryName

                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    invalid = ex.Message
                });
            }
        }

        [Route("delete/{id}")]
        [HttpDelete]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var product = _context.Products
                    .Include(x=>x.ProductImages)
                    .SingleOrDefault(x => x.Id == id);
                if (product == null)
                    return NotFound();

                if (product.ProductImages != null)
                {
                    foreach (var image in product.ProductImages)
                    {
                        _imageService.DeleteImage(image.Name);
                        _context.ProductImages.Remove(image);
                    }
                    await _context.SaveChangesAsync();
                }

                _context.Products.Remove(product);
                await _context.SaveChangesAsync();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new { invalid = "Something went wrong on server " + ex.Message });
            }
        }

        [Route("get/{id}")]
        [HttpGet]
        [AllowAnonymous]
        public IActionResult GetProductById(int id)
        {
            var product = _context.Products
                .Include(c => c.Category)
                .Include(x => x.ProductImages)
                .SingleOrDefault(x => x.Id == id);

            if (product == null)
                return NotFound();

            var productDto = _mapper.Map<ProductEditViewModel>(product);

            productDto.Images = productDto.Images
                .OrderBy(x => x.DateCreated)
                .ToList();

            return Ok(productDto);
        }


        [HttpPut("edit")]
        public IActionResult Edit([FromBody] ProductSaveViewModel model)
        {
            try
            {
                var product = _context.Products
                    .Include(x => x.ProductImages)
                    .SingleOrDefault(x => x.Id == model.Id);

                if (product == null)
                    return NotFound();

                product.Name = model.Name;
                product.Priority = model.Priority;
                product.Price = model.Price ?? 0;
                product.Description = model.Description;
                product.CategoryId = model.CategoryId;

                if (product.ProductImages != null)
                {
                    var imagesToRemove = product.ProductImages
                        .Where(img => !model.ids.Contains(img.Id))
                        .ToList();

                    foreach (var img in imagesToRemove)
                    {
                        _imageService.DeleteImage(img.Name);
                        _context.ProductImages.Remove(img);
                    }
                }

                var updatedImages = new List<ProductImageEntity>();
                for (int i = 0; i < model.ids.Length; i++)
                {
                    var id = model.ids[i];
                    var img = _context.ProductImages.FirstOrDefault(x => x.Id == id);
                    if (img != null)
                    {
                        img.ProductId = product.Id;
                        img.DateCreated = DateTime.UtcNow.AddSeconds(i);
                        updatedImages.Add(img);
                    }
                }
                product.ProductImages = updatedImages;

                _context.SaveChanges();
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new { invalid = ex.Message });
            }
        }


    }
}
